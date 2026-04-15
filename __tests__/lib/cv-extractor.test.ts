/**
 * @jest-environment node
 */

// Must be declared with var so jest.mock hoisting can access it
// eslint-disable-next-line no-var
var mockCreate: jest.Mock

jest.mock('@anthropic-ai/sdk', () => {
  mockCreate = jest.fn()
  const AnthropicMock = jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }))
  return { default: AnthropicMock, __esModule: true }
})
jest.mock('mammoth', () => ({ extractRawText: jest.fn() }))

import mammoth from 'mammoth'
import { extractTextFromBuffer } from '@/lib/cv-extractor'

const mockMammothExtract = mammoth.extractRawText as jest.MockedFunction<
  typeof mammoth.extractRawText
>

const PDF_MIME = 'application/pdf' as const
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' as const

describe('extractTextFromBuffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('extracts text from PDF using Claude document API', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Ahmed Ali — Software Engineer' }],
    })

    const buf = Buffer.from('fake pdf bytes')
    const result = await extractTextFromBuffer(buf, PDF_MIME)

    expect(result).toBe('Ahmed Ali — Software Engineer')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: expect.arrayContaining([
          expect.objectContaining({
            content: expect.arrayContaining([
              expect.objectContaining({ type: 'document' }),
            ]),
          }),
        ]),
      })
    )
  })

  it('extracts Arabic text from PDF', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'أحمد علي\nمهندس برمجيات\nالرياض' }],
    })

    const buf = Buffer.from('arabic pdf')
    const result = await extractTextFromBuffer(buf, PDF_MIME)

    expect(result).toContain('أحمد علي')
    expect(result).toContain('مهندس برمجيات')
  })

  it('extracts text from DOCX buffer using mammoth', async () => {
    mockMammothExtract.mockResolvedValue({ value: 'Ahmed Ali — Software Engineer', messages: [] })
    const buf = Buffer.from('fake docx bytes')
    const result = await extractTextFromBuffer(buf, DOCX_MIME)
    expect(result).toBe('Ahmed Ali — Software Engineer')
    expect(mockMammothExtract).toHaveBeenCalledWith({ buffer: buf })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('throws on empty extracted text from PDF', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: '   ' }],
    })

    const buf = Buffer.from('empty')
    await expect(extractTextFromBuffer(buf, PDF_MIME)).rejects.toThrow(
      'لم يتم العثور على نص في الملف'
    )
  })

  it('throws when Claude returns non-text content', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'tool_use', id: 'x', name: 'x', input: {} }],
    })

    const buf = Buffer.from('bad pdf')
    await expect(extractTextFromBuffer(buf, PDF_MIME)).rejects.toThrow()
  })
})
