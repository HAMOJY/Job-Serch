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
    language_quality: z.number().int().min(0).max(100).optional().default(70),
    ats_compatibility: z.number().int().min(0).max(100).optional().default(70),
  }),
  strengths: z.array(z.string()).min(1).max(5).optional().default([]),
  recommendations: z.array(z.string()).min(3).max(8),
  detected_role: z.string().optional().default(''),
  key_skills: z.array(z.string()).min(0).max(10).optional().default([]),
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
  // Extended fields (may be absent in older rows)
  strengths?: string[]
  detected_role?: string
  key_skills?: string[]
}

const SYSTEM_PROMPT = `أنت خبير عالمي في تحليل السير الذاتية للسوق العربي والدولي. مهمتك تحليل السيرة الذاتية بعمق وإعطاء تقرير استشاري متكامل.

قواعد التحليل:
- كن صريحاً ودقيقاً في التقييم — لا مجاملات
- التوصيات يجب أن تكون محددة وقابلة للتنفيذ فوراً
- ركّز على ما يجعل المرشح متميزاً في سوق العمل العربي
- أجب دائماً بـ JSON صحيح فقط، بدون أي نص خارج الـ JSON`

function buildPrompt(text: string): string {
  return `حلل هذه السيرة الذاتية بعمق واحترافية وأعطني JSON بهذا الشكل بالضبط:

{
  "score": <رقم من 0 إلى 100 يمثل جودة وتنافسية السيرة الذاتية في سوق العمل العربي>,
  "detected_role": "<المسمى الوظيفي أو المجال الذي يستهدفه صاحب السيرة، مثل: مهندس برمجيات، محاسب، مصمم جرافيك>",
  "key_skills": ["<مهارة 1>", "<مهارة 2>", "<مهارة 3>", "<حتى 8 مهارات بارزة>"],
  "categories": {
    "technical_skills": <0-100 — مهاراته التقنية والمهنية المحددة>,
    "work_experience": <0-100 — جودة وعمق خبراته العملية>,
    "education": <0-100 — التعليم والشهادات والدورات>,
    "clarity": <0-100 — وضوح وتنظيم وتنسيق السيرة>,
    "language_quality": <0-100 — جودة اللغة والكتابة والإملاء>,
    "ats_compatibility": <0-100 — مدى توافق السيرة مع أنظمة الفلترة الآلية ATS>
  },
  "strengths": [
    "<نقطة قوة محددة 1 — ما يميز هذا المرشح فعلاً>",
    "<نقطة قوة 2>",
    "<حتى 4 نقاط قوة حقيقية>"
  ],
  "recommendations": [
    "<توصية محددة وقابلة للتنفيذ 1>",
    "<توصية 2>",
    "<توصية 3>",
    "<توصية 4>",
    "<حتى 7 توصيات مرتبة بالأولوية>"
  ]
}

السيرة الذاتية:
${text}`
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function analyzeCV(text: string): Promise<AnalysisResult> {
  if (!text.trim()) throw new Error('CV text must not be empty')

  let lastError: unknown

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 3000,
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
      if (err instanceof z.ZodError) throw err
      lastError = err
    }
  }

  throw lastError
}
