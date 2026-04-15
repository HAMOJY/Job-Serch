import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// ── Types ──────────────────────────────────────────────────────────────────

export interface AdzunaJob {
  id: string
  title: string
  company: { display_name: string }
  location: { display_name: string }
  description: string
  redirect_url: string
  salary_min?: number
  salary_max?: number
  created: string
  category: { label: string }
}

export interface ScoredJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  salary_min?: number
  salary_max?: number
  created: string
  category: string
  match_score: number
  match_reasons: string[]
}

// ── Zod schema for Claude's scoring response ───────────────────────────────

const ScoringSchema = z.object({
  jobs: z.array(
    z.object({
      id: z.string(),
      match_score: z.number().int().min(0).max(100),
      match_reasons: z.array(z.string()).min(1).max(3),
    })
  ),
})

// ── Helpers ────────────────────────────────────────────────────────────────

async function fetchAdzunaJobs(
  role: string,
  country: string,
  page = 1
): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID
  const appKey = process.env.ADZUNA_APP_KEY
  if (!appId || !appKey) return []

  const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/${page}`)
  url.searchParams.set('app_id', appId)
  url.searchParams.set('app_key', appKey)
  url.searchParams.set('results_per_page', '10')
  url.searchParams.set('what', role)
  url.searchParams.set('content-type', 'application/json')

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) return []

  const data = await res.json()
  return (data?.results as AdzunaJob[]) ?? []
}

async function scoreJobsWithClaude(
  jobs: AdzunaJob[],
  detectedRole: string,
  keySkills: string[]
): Promise<Map<string, { match_score: number; match_reasons: string[] }>> {
  if (!jobs.length) return new Map()

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const jobsText = jobs
    .map(
      (j) =>
        `ID: ${j.id}
Title: ${j.title}
Company: ${j.company.display_name}
Description: ${j.description.slice(0, 300)}`
    )
    .join('\n---\n')

  const prompt = `أنت خبير في مطابقة الوظائف. المستخدم يبحث عن وظيفة في مجال: ${detectedRole}
مهاراته الرئيسية: ${keySkills.join(', ')}

قيّم مدى تطابق كل وظيفة مع ملف المستخدم على مقياس 0-100.
أعطني JSON فقط بهذا الشكل:
{
  "jobs": [
    { "id": "<job_id>", "match_score": <0-100>, "match_reasons": ["سبب 1", "سبب 2"] }
  ]
}

الوظائف:
${jobsText}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: [
        {
          type: 'text',
          text: 'أنت خبير في مطابقة الوظائف. أجب دائماً بـ JSON صحيح فقط.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```\s*$/i, '')
      .trim()

    const parsed = ScoringSchema.parse(JSON.parse(text))
    return new Map(parsed.jobs.map((j) => [j.id, { match_score: j.match_score, match_reasons: j.match_reasons }]))
  } catch {
    // Fall back: give all jobs a neutral score
    const fallback = new Map<string, { match_score: number; match_reasons: string[] }>()
    jobs.forEach((j) => fallback.set(j.id, { match_score: 50, match_reasons: ['وظيفة ذات صلة'] }))
    return fallback
  }
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 })
  }

  let body: { country?: string }
  try {
    body = await req.json()
  } catch {
    body = {}
  }

  const country = (body.country ?? 'ae').toLowerCase()
  const ALLOWED_COUNTRIES = ['ae', 'sa', 'gb', 'us', 'au', 'ca']
  if (!ALLOWED_COUNTRIES.includes(country)) {
    return NextResponse.json({ error: 'دولة غير مدعومة' }, { status: 400 })
  }

  // Fetch the user's latest CV analysis
  const { data: analysis } = await supabase
    .from('cv_analyses')
    .select('detected_role, key_skills')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!analysis || !analysis.detected_role) {
    return NextResponse.json(
      { error: 'لم نتمكن من تحديد مجالك — يرجى تحليل سيرتك الذاتية أولاً' },
      { status: 422 }
    )
  }

  const detectedRole = analysis.detected_role as string
  const keySkills = (analysis.key_skills as string[]) ?? []

  // Fetch jobs from Adzuna
  const rawJobs = await fetchAdzunaJobs(detectedRole, country)

  if (!rawJobs.length) {
    return NextResponse.json({ jobs: [], role: detectedRole, country })
  }

  // Score with Claude
  const scores = await scoreJobsWithClaude(rawJobs, detectedRole, keySkills)

  // Merge and sort
  const scoredJobs: ScoredJob[] = rawJobs
    .map((j) => {
      const scoring = scores.get(j.id) ?? { match_score: 50, match_reasons: [] }
      return {
        id: j.id,
        title: j.title,
        company: j.company.display_name,
        location: j.location.display_name,
        description: j.description.slice(0, 400),
        url: j.redirect_url,
        salary_min: j.salary_min,
        salary_max: j.salary_max,
        created: j.created,
        category: j.category.label,
        match_score: scoring.match_score,
        match_reasons: scoring.match_reasons,
      }
    })
    .sort((a, b) => b.match_score - a.match_score)

  return NextResponse.json({ jobs: scoredJobs, role: detectedRole, country })
}
