import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AnalyzeClient from './analyze-client'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ selectRole?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .maybeSingle()

  const { data: latestAnalysis } = await supabase
    .from('cv_analyses')
    .select('id, filename, score, categories, recommendations, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const params = await searchParams
  const selectRole = params.selectRole === '1'

  return (
    <AnalyzeClient
      profile={profile}
      userId={user.id}
      showRoleModal={selectRole}
      emailVerified={!!user.email_confirmed_at}
      initialAnalysis={(latestAnalysis as CvAnalysisRow | null) ?? null}
    />
  )
}
