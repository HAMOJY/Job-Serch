/**
 * @jest-environment node
 */

// jest.mock() is hoisted before any variable initialisation.
// Variables referenced inside the factory must be hoisted too (i.e. declared with
// `var`), otherwise they are in the Temporal Dead Zone when the factory executes.
//
// The cv-analyzer module creates `const client = new Anthropic(...)` at module
// scope, so the constructor is called exactly once (at import time).  We return
// the same singleton object every time the constructor is called so that tests
// can control `messages.create` on that object.

/* eslint-disable no-var */
var sharedMockInstance: { messages: { create: jest.Mock } }
/* eslint-enable no-var */

jest.mock('@anthropic-ai/sdk', () => {
  sharedMockInstance = { messages: { create: jest.fn() } }
  return {
    __esModule: true,
    default: jest.fn(() => sharedMockInstance),
  }
})

import { analyzeCV } from '@/lib/cv-analyzer'

const VALID_RESPONSE = {
  score: 87,
  categories: {
    technical_skills: 91,
    work_experience: 85,
    education: 78,
    clarity: 94,
  },
  recommendations: [
    'أضف مشاريع GitHub لتعزيز ملفك التقني',
    'اذكر الإنجازات بأرقام وليس بعبارات مبهمة',
    'أضف شهادة احترافية في مجالك',
  ],
}

describe('analyzeCV', () => {
  let mockCreate: jest.Mock

  beforeAll(() => {
    // The factory runs once; grab the create fn from the singleton
    mockCreate = sharedMockInstance.messages.create
  })

  beforeEach(() => mockCreate.mockReset())

  it('returns structured analysis for a CV', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify(VALID_RESPONSE) }],
    })

    const result = await analyzeCV('Ahmed Ali\nSoftware Engineer\n5 years experience')
    expect(result.score).toBe(87)
    expect(result.categories.technical_skills).toBe(91)
    expect(result.recommendations).toHaveLength(3)
  })

  it('strips markdown code fences from response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '```json\n' + JSON.stringify(VALID_RESPONSE) + '\n```' }],
    })

    const result = await analyzeCV('some cv text')
    expect(result.score).toBe(87)
  })

  it('retries once on first failure', async () => {
    mockCreate
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(VALID_RESPONSE) }],
      })

    const result = await analyzeCV('some cv text')
    expect(result.score).toBe(87)
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('throws after two failures', async () => {
    mockCreate.mockRejectedValue(new Error('API down'))
    await expect(analyzeCV('some cv text')).rejects.toThrow()
    expect(mockCreate).toHaveBeenCalledTimes(2)
  })

  it('throws on invalid JSON response', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'not valid json at all' }],
    })
    await expect(analyzeCV('some cv text')).rejects.toThrow()
  })

  it('throws on valid JSON but wrong schema (missing score)', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: JSON.stringify({ categories: {}, recommendations: [] }) }],
    })
    await expect(analyzeCV('some cv text')).rejects.toThrow()
    // Should fail on Zod validation without retrying
    expect(mockCreate).toHaveBeenCalledTimes(1)
  })
})
