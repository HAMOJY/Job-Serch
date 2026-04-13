import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import AnalyzeClient from './analyze-client'

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ selectRole?: string }>
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, role')
    .eq('id', user.id)
    .single()

  const params = await searchParams
  const selectRole = params.selectRole === '1'

  return <AnalyzeClient profile={profile} userId={user.id} showRoleModal={selectRole} />
}
