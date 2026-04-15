import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import ApplicationsClient from './applications-client'

export default async function ApplicationsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: applications } = await supabase
    .from('job_applications')
    .select('id, job_title, company, job_location, job_url, status, created_at, applied_at, notes')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <ApplicationsClient applications={applications ?? []} />
}
