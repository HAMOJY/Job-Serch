'use client'

import { useState } from 'react'
import ProfileForm from './ProfileForm'
import SecurityForm from './SecurityForm'
import DeleteAccountDialog from './DeleteAccountDialog'

interface Profile {
  id: string
  name: string
  job_title: string | null
  location: string | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
}

interface Props {
  profile: Profile
  isOAuthUser: boolean
}

const tabs = [
  { id: 'profile', label: 'الملف الشخصي' },
  { id: 'security', label: 'الأمان' },
  { id: 'account', label: 'الحساب' },
] as const

type TabId = (typeof tabs)[number]['id']

export default function SettingsTabs({ profile, isOAuthUser }: Props) {
  const [active, setActive] = useState<TabId>('profile')

  return (
    <div>
      <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #1A3060', marginBottom: '1.5rem' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              borderBottom: active === tab.id ? '2px solid #C9A84C' : '2px solid transparent',
              color: active === tab.id ? '#C9A84C' : '#8A9AB8',
              padding: '0.625rem 1rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: active === tab.id ? 600 : 400,
              marginBottom: '-1px',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'profile' && <ProfileForm profile={profile} />}
      {active === 'security' && <SecurityForm isOAuthUser={isOAuthUser} />}
      {active === 'account' && (
        <div>
          <h3 style={{ color: '#E8EAF0', marginBottom: '1rem' }}>إعدادات الحساب</h3>
          <DeleteAccountDialog />
        </div>
      )}
    </div>
  )
}
