/**
 * @jest-environment node
 */

jest.mock('pdf-parse', () => ({
  PDFParse: jest.fn(),
}))
jest.mock('mammoth', () => ({ extractRawText: jest.fn() }))

import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'
import { extractTextFromBuffer } from '@/lib/cv-extractor'

const MockPDFParse = PDFParse as jest.MockedClass<typeof PDFParse>
const mockMammothExtract = mammoth.extractRawText as jest.MockedFunction<
  typeof mammoth.extractRawText
>

const PDF_MIME = 'application/pdf' as const
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' as const

describe('extractTextFromBuffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('extracts text from PDF buffer', async () => {
    const mockGetText = jest.fn().mockResolvedValue({ text: 'Ahmed Ali — Software Engineer' })
    const mockDestroy = jest.fn().mockResolvedValue(undefined)
    MockPDFParse.mockImplementation(() => ({
      getText: mockGetText,
      destroy: mockDestroy,
    } as unknown as InstanceType<typeof PDFParse>))

    const buf = Buffer.from('fake pdf bytes')
    const result = await extractTextFromBuffer(buf, PDF_MIME)

    expect(result).toBe('Ahmed Ali — Software Engineer')
    expect(MockPDFParse).toHaveBeenCalledWith({ data: expect.any(Uint8Array) })
    expect(mockGetText).toHaveBeenCalled()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('extracts text from DOCX buffer', async () => {
    mockMammothExtract.mockResolvedValue({ value: 'Ahmed Ali — Software Engineer', messages: [] })
    const buf = Buffer.from('fake docx bytes')
    const result = await extractTextFromBuffer(buf, DOCX_MIME)
    expect(result).toBe('Ahmed Ali — Software Engineer')
    expect(mockMammothExtract).toHaveBeenCalledWith({ buffer: buf })
  })

  it('throws on empty extracted text', async () => {
    const mockGetText = jest.fn().mockResolvedValue({ text: '   ' })
    const mockDestroy = jest.fn().mockResolvedValue(undefined)
    MockPDFParse.mockImplementation(() => ({
      getText: mockGetText,
      destroy: mockDestroy,
    } as unknown as InstanceType<typeof PDFParse>))

    const buf = Buffer.from('empty')
    await expect(extractTextFromBuffer(buf, PDF_MIME)).rejects.toThrow(
      'لم يتم العثور على نص في الملف'
    )
    expect(mockDestroy).toHaveBeenCalled()
  })
})
