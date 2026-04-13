import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import SettingsTabs from '@/components/profile/SettingsTabs'

export default async function ProfileSettingsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, name, job_title, location, bio, linkedin_url, github_url')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth/login')

  const isOAuthUser = user.app_metadata?.provider !== 'email'

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060D1A',
      padding: '2rem 1rem',
      direction: 'rtl',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ color: '#E8EAF0', fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
          إعدادات الحساب
        </h1>
        <p style={{ color: '#8A9AB8', fontSize: '0.9rem', marginBottom: '2rem' }}>
          {profile.name}
        </p>

        <div style={{
          background: '#0A1628',
          border: '1px solid #1A3060',
          borderRadius: '16px',
          padding: '1.5rem',
        }}>
          <SettingsTabs profile={profile} isOAuthUser={isOAuthUser} />
        </div>
      </div>
    </div>
  )
}
