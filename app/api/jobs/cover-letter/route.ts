import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let body: { job_title?: string; company?: string; job_description?: string; language?: 'ar' | 'en' }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }

  const { job_title, company, job_description, language = 'ar' } = body
  if (!job_title || !company) {
    return NextResponse.json({ error: 'يرجى تقديم عنوان الوظيفة والشركة' }, { status: 400 })
  }

  // Get user's latest CV analysis
  const { data: analysis } = await supabase
    .from('cv_analyses')
    .select('detected_role, key_skills, recommendations')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Get user's profile name
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  const applicantName = profile?.name ?? 'المتقدم'
  const detectedRole = analysis?.detected_role ?? job_title
  const keySkills = ((analysis?.key_skills as string[]) ?? []).slice(0, 6).join('، ')

  const isArabic = language === 'ar'
  const prompt = isArabic
    ? `اكتب خطاب تقديم وظيفي احترافي باللغة العربية للمتقدم التالي:

الاسم: ${applicantName}
المجال/الدور: ${detectedRole}
المهارات الرئيسية: ${keySkills || 'غير محدد'}

الوظيفة المُتقدَّم إليها:
العنوان: ${job_title}
الشركة: ${company}
${job_description ? `وصف الوظيفة: ${job_description.slice(0, 500)}` : ''}

اكتب خطاباً احترافياً مكوناً من 3 فقرات:
1. فقرة تعريفية تذكر الاسم والوظيفة والاهتمام بها
2. فقرة تبرز المهارات والخبرات المناسبة للوظيفة
3. فقرة ختامية تطلب فرصة المقابلة

الخطاب يجب أن يكون:
- احترافي ومقنع
- مخصص لهذه الوظيفة تحديداً
- باللغة العربية الفصحى
- بين 200-300 كلمة`
    : `Write a professional cover letter in English for:

Applicant: ${applicantName}
Role/Field: ${detectedRole}
Key Skills: ${keySkills || 'Not specified'}

Job Details:
Title: ${job_title}
Company: ${company}
${job_description ? `Description: ${job_description.slice(0, 500)}` : ''}

Write a 3-paragraph professional cover letter (150-250 words) tailored to this specific position.`

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: [
        {
          type: 'text',
          text: isArabic
            ? 'أنت كاتب خطابات وظيفية محترف. اكتب خطابات مقنعة ومخصصة.'
            : 'You are a professional cover letter writer. Write compelling, tailored cover letters.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    const coverLetter = (message.content[0] as { type: string; text: string }).text.trim()
    return NextResponse.json({ cover_letter: coverLetter })
  } catch (err) {
    console.error('Cover letter generation failed:', err)
    return NextResponse.json({ error: 'حدث خطأ، حاول مجدداً' }, { status: 500 })
  }
}
