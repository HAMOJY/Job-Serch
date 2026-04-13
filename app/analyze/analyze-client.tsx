'use client'

import { useState } from 'react'
import RoleModal from '@/components/auth/RoleModal'

interface Profile {
  id: string
  name: string
  role: string
}

interface Props {
  profile: Profile | null
  userId: string
  showRoleModal: boolean
}

export default function AnalyzeClient({ profile, userId, showRoleModal }: Props) {
  const [modalOpen, setModalOpen] = useState(showRoleModal)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060D1A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      direction: 'rtl',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ textAlign: 'center', color: '#E8EAF0' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧠</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          أهلاً، {profile?.name ?? 'مستخدم'} 👋
        </h1>
        <p style={{ color: '#8A9AB8' }}>صفحة تحليل الـ CV — قريباً</p>
      </div>

      {modalOpen && (
        <RoleModal userId={userId} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
