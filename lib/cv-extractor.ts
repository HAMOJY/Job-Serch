import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import mammoth from 'mammoth'

export type SupportedMimeType =
  | 'application/pdf'
  | 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

/**
 * Extract text from a PDF buffer using Claude's native document understanding.
 * This handles Arabic, English, and mixed-language PDFs without any PDF parsing library.
 */
async function extractFromPDF(buffer: Buffer): Promise<string> {
  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'document',
            source: {
              type: 'base64',
              media_type: 'application/pdf',
              data: buffer.toString('base64'),
            },
          } as Parameters<typeof client.messages.create>[0]['messages'][0]['content'][0],
          {
            type: 'text',
            text: 'استخرج كل النص الموجود في هذا المستند كما هو بالضبط، بدون أي تعليق أو تفسير. فقط النص الخام.',
          },
        ],
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') throw new Error('Unexpected response from Claude')
  return content.text.trim()
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
