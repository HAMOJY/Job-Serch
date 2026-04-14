import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const AnalysisSchema = z.object({
  score: z.number().int().min(0).max(100),
  categories: z.object({
    technical_skills: z.number().int().min(0).max(100),
    work_experience: z.number().int().min(0).max(100),
    education: z.number().int().min(0).max(100),
    clarity: z.number().int().min(0).max(100),
  }),
  recommendations: z.array(z.string()).min(1).max(10),
})

export type AnalysisResult = z.infer<typeof AnalysisSchema>

export interface CvAnalysisRow {
  id: string
  user_id: string
  filename: string
  file_path: string
  score: number
  categories: AnalysisResult['categories']
  recommendations: string[]
  status: 'done' | 'error'
  error_msg: string | null
  created_at: string
}

const SYSTEM_PROMPT = `أنت خبير في تحليل السير الذاتية للسوق العربي. مهمتك تحليل السيرة الذاتية وإعطاء تقرير مفصل.
أجب دائماً بـ JSON صحيح فقط، بدون أي نص خارج الـ JSON.`

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function buildPrompt(text: string): string {
  return `حلل السيرة الذاتية التالية وأعطني JSON بهذا الشكل بالضبط:
{
  "score": <رقم من 0 إلى 100 يمثل جودة السيرة الذاتية>,
  "categories": {
    "technical_skills": <0-100>,
    "work_experience": <0-100>,
    "education": <0-100>,
    "clarity": <0-100>
  },
  "recommendations": [
    "<توصية 1 بالعربية>",
    "<توصية 2 بالعربية>",
    "<توصية 3 بالعربية>"
  ]
}

السيرة الذاتية:
${text}`
}

export async function analyzeCV(text: string): Promise<AnalysisResult> {
  if (!text.trim()) throw new Error('CV text must not be empty')

  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: buildPrompt(text) }],
      })

      const content = message.content[0]
      if (content.type !== 'text') throw new Error('Unexpected response type from Claude')

      const jsonText = content.text
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```\s*$/i, '')
        .trim()

      return AnalysisSchema.parse(JSON.parse(jsonText))
    } catch (err) {
      if (err instanceof z.ZodError) throw err  // schema failure: don't retry
      lastError = err
    }
  }

  throw lastError
}
