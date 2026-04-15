import 'server-only'
import mammoth from 'mammoth'

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

async function extractFromPDF(buffer: Buffer): Promise<string> {
  // pdfjs-dist/legacy has proper Arabic/Unicode support unlike pdf-parse
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs' as string)

  const doc = await getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
    // Disable workers — not available in Node.js server environment
    // @ts-expect-error — disableAutoFetch not in types but works at runtime
    disableWorker: true,
  }).promise

  const pageTexts: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    // Join items preserving order; add newline between blocks
    const pageText = content.items
      .map((item: { str?: string }) => item.str ?? '')
      .join(' ')
    pageTexts.push(pageText)
  }

  return pageTexts.join('\n').trim()
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: SupportedMimeType
): Promise<string> {
  let text: string

  if (mimeType === 'application/pdf') {
    text = await extractFromPDF(buffer)
  } else {
    const result = await mammoth.extractRawText({ buffer })
    text = result.value
  }

  if (!text || !text.trim()) {
    throw new Error('لم يتم العثور على نص في الملف')
  }

  return text.trim()
}
