/**
 * @jest-environment node
 */

const mockCreate = jest.fn()

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  })),
}))

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
  beforeEach(() => jest.clearAllMocks())

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
})
