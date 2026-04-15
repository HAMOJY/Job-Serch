import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import JobsClient from './jobs-client'

export default async function JobsPage() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: analysis } = await supabase
    .from('cv_analyses')
    .select('id, detected_role, key_skills, score')
    .eq('user_id', user.id)
    .eq('status', 'done')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .maybeSingle()

  return (
    <JobsClient
      hasAnalysis={!!analysis}
      detectedRole={analysis?.detected_role ?? null}
      keySkills={(analysis?.key_skills as string[] | null) ?? []}
      cvScore={analysis?.score ?? null}
      userName={profile?.name ?? null}
    />
  )
}
