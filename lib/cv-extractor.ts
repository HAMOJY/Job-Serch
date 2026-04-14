import 'server-only'
import { PDFParse } from 'pdf-parse'
import mammoth from 'mammoth'

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: SupportedMimeType
): Promise<string> {
  let text: string

  if (mimeType === 'application/pdf') {
    const parser = new PDFParse(buffer)
    const data = await parser.getText()
    text = data.text
  } else {
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  if (!text || !text.trim()) {
    throw new Error('لم يتم العثور على نص في الملف')
  }

  return text.trim()
}
