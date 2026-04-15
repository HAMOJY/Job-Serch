import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// ── Types ──────────────────────────────────────────────────────────────────

export interface QAAnswer {
  question: string
  answer: string
}

export interface ApplyPackage {
  cover_letter: string
  qa_answers: QAAnswer[]
  email_subject: string
  email_body: string
  linkedin_message: string
  language: 'ar' | 'en'
}

// ── Zod schema ─────────────────────────────────────────────────────────────

const PackageSchema = z.object({
  cover_letter: z.string().min(50),
  qa_answers: z.array(
    z.object({
      question: z.string(),
      answer: z.string(),
    })
  ).min(3).max(8),
  email_subject: z.string().min(5),
  email_body: z.string().min(50),
  linkedin_message: z.string().min(20).max(500),
})

// ── Route ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body: {
    job_title?: string
    company?: string
    job_location?: string
    job_description?: string
    job_url?: string
    language?: 'ar' | 'en'
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }

  const { job_title, company, job_location, job_description, language = 'ar' } = body
  if (!job_title || !company) {
    return NextResponse.json({ error: 'يرجى تقديم عنوان الوظيفة والشركة' }, { status: 400 })
  }

  // Fetch user's CV analysis + profile
  const [{ data: analysis }, { data: profile }] = await Promise.all([
    supabase
      .from('cv_analyses')
      .select('detected_role, key_skills, strengths, recommendations, score')
      .eq('user_id', user.id)
      .eq('status', 'done')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('name, job_title, location, bio')
      .eq('id', user.id)
      .maybeSingle(),
  ])

  const applicantName = profile?.name ?? 'المتقدم'
  const detectedRole = analysis?.detected_role ?? job_title
  const keySkills = ((analysis?.key_skills as string[]) ?? []).join('، ')
  const strengths = ((analysis?.strengths as string[]) ?? []).join('، ')
  const cvScore = analysis?.score ?? 0

  const isArabic = language === 'ar'

  const systemPrompt = isArabic
    ? `أنت خبير في التقديم على الوظائف وكتابة السير الذاتية. تخصصك مساعدة المتقدمين العرب للحصول على وظائف في الشركات المحلية والدولية. أجب دائماً بـ JSON صحيح فقط.`
    : `You are an expert in job applications and career coaching. You specialize in helping candidates land jobs at top companies. Always respond with valid JSON only.`

  const prompt = isArabic
    ? `اكتب حزمة تقديم وظيفي كاملة واحترافية لهذا المتقدم:

**معلومات المتقدم:**
- الاسم: ${applicantName}
- المجال: ${detectedRole}
- المهارات: ${keySkills || 'غير محدد'}
- نقاط القوة: ${strengths || 'غير محدد'}
- تقييم الـ CV: ${cvScore}/100

**الوظيفة:**
- العنوان: ${job_title}
- الشركة: ${company}
- الموقع: ${job_location ?? 'غير محدد'}
${job_description ? `- الوصف: ${job_description.slice(0, 600)}` : ''}

أعطني JSON بهذا الشكل بالضبط:
{
  "cover_letter": "<خطاب تقديم احترافي 3-4 فقرات، مخصص لهذه الوظيفة تحديداً، يبرز المهارات المناسبة>",
  "qa_answers": [
    {"question": "لماذا تريد العمل في ${company}؟", "answer": "<إجابة مقنعة ومخصصة>"},
    {"question": "ما أبرز إنجازاتك المهنية؟", "answer": "<إجابة بأمثلة ملموسة>"},
    {"question": "كيف تصف نفسك مهنياً؟", "answer": "<إجابة تبرز نقاط القوة>"},
    {"question": "ما هي خططك المهنية للسنوات الخمس القادمة؟", "answer": "<إجابة طموحة وواقعية>"},
    {"question": "ما الذي يميّزك عن باقي المتقدمين؟", "answer": "<إجابة تبرز التميّز الحقيقي>"}
  ],
  "email_subject": "<موضوع إيميل تقديم احترافي>",
  "email_body": "<نص إيميل تقديم كامل يتضمن التحية والتقديم والمهارات وطلب المقابلة>",
  "linkedin_message": "<رسالة LinkedIn قصيرة لإرسالها للمسؤول عن التوظيف — مقنعة ومختصرة تحت 300 حرف>"
}`
    : `Write a complete professional job application package for this candidate:

**Candidate:**
- Name: ${applicantName}
- Field: ${detectedRole}
- Skills: ${keySkills || 'Not specified'}
- Strengths: ${strengths || 'Not specified'}
- CV Score: ${cvScore}/100

**Job:**
- Title: ${job_title}
- Company: ${company}
- Location: ${job_location ?? 'Not specified'}
${job_description ? `- Description: ${job_description.slice(0, 600)}` : ''}

Return JSON exactly:
{
  "cover_letter": "<Professional 3-4 paragraph cover letter tailored to this specific role>",
  "qa_answers": [
    {"question": "Why do you want to work at ${company}?", "answer": "<Compelling tailored answer>"},
    {"question": "What are your top professional achievements?", "answer": "<Answer with concrete examples>"},
    {"question": "How would you describe yourself professionally?", "answer": "<Answer highlighting strengths>"},
    {"question": "Where do you see yourself in 5 years?", "answer": "<Ambitious yet realistic answer>"},
    {"question": "What makes you stand out from other candidates?", "answer": "<Genuine differentiator>"}
  ],
  "email_subject": "<Professional application email subject>",
  "email_body": "<Complete application email with greeting, pitch, skills, and interview request>",
  "linkedin_message": "<Short LinkedIn message to the hiring manager — compelling, under 300 chars>"
}`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 3000,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: prompt }],
    })

    const raw = (message.content[0] as { type: string; text: string }).text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    const parsed = PackageSchema.parse(JSON.parse(raw))
    const result: ApplyPackage = { ...parsed, language }
    return NextResponse.json(result)
  } catch (err) {
    console.error('Apply package generation failed:', err)
    return NextResponse.json({ error: 'حدث خطأ في توليد حزمة التقديم، حاول مجدداً' }, { status: 500 })
  }
}
