import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('job_applications')
    .insert({
      user_id: user.id,
      job_title: body.job_title,
      company: body.company,
      job_location: body.job_location,
      job_url: body.job_url,
      job_description: body.job_description,
      cover_letter: body.cover_letter,
      qa_answers: body.qa_answers,
      email_subject: body.email_subject,
      email_body: body.email_body,
      linkedin_message: body.linkedin_message,
      status: body.status ?? 'prepared',
      applied_at: body.status === 'applied' ? new Date().toISOString() : null,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Save application failed:', error)
    return NextResponse.json({ error: 'فشل حفظ الطلب' }, { status: 500 })
  }

  return NextResponse.json({ id: data.id })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })

  let body: { id?: string; status?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 })
  }

  if (!body.id) return NextResponse.json({ error: 'id مطلوب' }, { status: 400 })

  const updateData: Record<string, unknown> = {}
  if (body.status) {
    updateData.status = body.status
    if (body.status === 'applied' || body.status === 'emailed') {
      updateData.applied_at = new Date().toISOString()
    }
  }
  if (body.notes !== undefined) updateData.notes = body.notes

  const { error } = await supabase
    .from('job_applications')
    .update(updateData)
    .eq('id', body.id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: 'فشل التحديث' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
