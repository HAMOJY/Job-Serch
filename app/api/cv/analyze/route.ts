import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { extractTextFromBuffer, type SupportedMimeType } from '@/lib/cv-extractor'
import { analyzeCV } from '@/lib/cv-analyzer'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_TYPES: Partial<Record<string, SupportedMimeType>> = {
  'application/pdf': 'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
}

function getExtension(mimeType: SupportedMimeType): string {
  return mimeType === 'application/pdf' ? 'pdf' : 'docx'
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'يرجى تفعيل بريدك الإلكتروني أولاً لتحليل سيرتك الذاتية' },
      { status: 403 }
    )
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'بيانات الطلب غير صحيحة' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
  }

  // Detect MIME — fall back to extension for DOCX (some browsers report wrong type)
  let mimeType = ALLOWED_TYPES[file.type]
  if (!mimeType && file.name.toLowerCase().endsWith('.docx')) {
    mimeType =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  if (!mimeType) {
    return NextResponse.json(
      { error: 'الملف يجب أن يكون PDF أو Word فقط' },
      { status: 415 }
    )
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'الملف يجب أن يكون أقل من 10 ميغابايت' },
      { status: 413 }
    )
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const analysisId = crypto.randomUUID()
  const ext = getExtension(mimeType)
  const filePath = `${user.id}/${analysisId}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('cvs')
    .upload(filePath, buffer, { contentType: mimeType })

  if (uploadError) {
    console.error('Storage upload failed:', uploadError)
    return NextResponse.json({ error: 'فشل رفع الملف' }, { status: 500 })
  }

  let extractedText: string
  try {
    extractedText = await extractTextFromBuffer(buffer, mimeType)
  } catch {
    const { error: removeErr } = await supabase.storage.from('cvs').remove([filePath])
    if (removeErr) console.error('Storage cleanup failed after extraction error:', removeErr)
    return NextResponse.json(
      { error: 'تعذّر قراءة الملف، تأكد أنه غير محمي بكلمة مرور' },
      { status: 422 }
    )
  }

  let analysis
  try {
    analysis = await analyzeCV(extractedText)
  } catch {
    const { error: removeErr } = await supabase.storage.from('cvs').remove([filePath])
    if (removeErr) console.error('Storage cleanup failed after analysis error:', removeErr)
    return NextResponse.json(
      { error: 'حدث خطأ في التحليل، حاول مجدداً' },
      { status: 500 }
    )
  }

  const { data: savedAnalysis, error: dbError } = await supabase
    .from('cv_analyses')
    .insert({
      id: analysisId,
      user_id: user.id,
      filename: file.name,
      file_path: filePath,
      score: analysis.score,
      categories: analysis.categories,
      recommendations: analysis.recommendations,
      status: 'done',
    })
    .select()
    .single()

  if (dbError || !savedAnalysis) {
    console.error('DB insert failed:', dbError)
    const { error: removeErr } = await supabase.storage.from('cvs').remove([filePath])
    if (removeErr) console.error('Storage cleanup failed after DB error:', removeErr)
    return NextResponse.json({ error: 'فشل حفظ النتائج' }, { status: 500 })
  }

  return NextResponse.json(savedAnalysis)
}
