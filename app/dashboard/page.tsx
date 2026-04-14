import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import DashboardClient from './dashboard-client'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  const { data: analyses } = await supabase
    .from('cv_analyses')
    .select('id, filename, score, categories, recommendations, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <DashboardClient
      profile={profile}
      user={{ email: user.email ?? '', emailVerified: !!user.email_confirmed_at, createdAt: user.created_at }}
      analyses={(analyses as CvAnalysisRow[] | null) ?? []}
    />
  )
}
