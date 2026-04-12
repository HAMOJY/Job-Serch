import { NextRequest, NextResponse } from 'next/server'
import { waitlistSchema } from '@/lib/validation'
import { supabaseAdmin } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = waitlistSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? 'بيانات غير صحيحة'
      return NextResponse.json({ error: firstError }, { status: 400 })
    }

    const { name, email, phone, role } = parsed.data

    const { error } = await supabaseAdmin
      .from('waitlist')
      .insert({ name, email, phone, role })

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'حدث خطأ، يرجى المحاولة مجدداً' },
        { status: 500 }
      )
    }

    await inngest.send({
      name: 'waitlist/user.registered',
      data: { name, email, role },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ، يرجى المحاولة مجدداً' },
      { status: 500 }
    )
  }
}
