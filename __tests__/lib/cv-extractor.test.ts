/**
 * @jest-environment node
 */

// pdfjs-dist is mapped to __mocks__/pdfjs-dist.js via jest.config.ts moduleNameMapper
const mockPdfJs = require('pdfjs-dist/legacy/build/pdf.mjs')
jest.mock('mammoth', () => ({ extractRawText: jest.fn() }))

import mammoth from 'mammoth'
import { extractTextFromBuffer } from '@/lib/cv-extractor'

const mockMammothExtract = mammoth.extractRawText as jest.MockedFunction<
  typeof mammoth.extractRawText
>

const PDF_MIME = 'application/pdf' as const
const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document' as const

function makePdfDocMock(pages: string[]) {
  return {
    promise: Promise.resolve({
      numPages: pages.length,
      getPage: jest.fn().mockImplementation(async (i: number) => ({
        getTextContent: async () => ({
          items: pages[i - 1].split(' ').map((str: string) => ({ str })),
        }),
      })),
    }),
  }
}

describe('extractTextFromBuffer', () => {
  beforeEach(() => jest.clearAllMocks())

  it('extracts text from PDF buffer using pdfjs-dist', async () => {
    mockPdfJs.getDocument.mockReturnValue(makePdfDocMock(['Ahmed Ali Software Engineer']))

    const buf = Buffer.from('fake pdf bytes')
    const result = await extractTextFromBuffer(buf, PDF_MIME)

    expect(result).toBe('Ahmed Ali Software Engineer')
    expect(mockPdfJs.getDocument).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.any(Uint8Array) })
    )
  })

  it('extracts Arabic text from multi-page PDF', async () => {
    mockPdfJs.getDocument.mockReturnValue(makePdfDocMock(['أحمد علي', 'مهندس برمجيات']))

    const buf = Buffer.from('arabic pdf')
    const result = await extractTextFromBuffer(buf, PDF_MIME)

    expect(result).toContain('أحمد علي')
    expect(result).toContain('مهندس برمجيات')
  })

  it('extracts text from DOCX buffer', async () => {
    mockMammothExtract.mockResolvedValue({ value: 'Ahmed Ali — Software Engineer', messages: [] })
    const buf = Buffer.from('fake docx bytes')
    const result = await extractTextFromBuffer(buf, DOCX_MIME)
    expect(result).toBe('Ahmed Ali — Software Engineer')
    expect(mockMammothExtract).toHaveBeenCalledWith({ buffer: buf })
  })

  it('throws on empty extracted text', async () => {
    mockPdfJs.getDocument.mockReturnValue(makePdfDocMock(['   ']))

    const buf = Buffer.from('empty')
    await expect(extractTextFromBuffer(buf, PDF_MIME)).rejects.toThrow(
      'لم يتم العثور على نص في الملف'
    )
  })
})
