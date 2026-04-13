'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

interface RoleModalProps {
  userId: string
  onClose: () => void
}

export default function RoleModal({ userId, onClose }: RoleModalProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<'job_seeker' | 'recruiter' | ''>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConfirm() {
    if (!selected) {
      setError('يرجى اختيار نوع الحساب')
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({ id: userId, name: '', role: selected }, { onConflict: 'id' })

    setLoading(false)

    if (updateError) {
      setError('حدث خطأ، يرجى المحاولة مجدداً')
      return
    }

    onClose()
    router.refresh()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#0A1628',
        border: '1px solid #1A3060',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '380px',
        direction: 'rtl',
        fontFamily: 'sans-serif',
      }}>
        <h2 style={{ color: '#E8EAF0', marginBottom: '0.5rem' }}>أهلاً بك!</h2>
        <p style={{ color: '#8A9AB8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          ما نوع حسابك؟
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          {([['job_seeker', 'باحث عن عمل', '🔍'], ['recruiter', 'مسؤول توظيف', '🏢']] as const).map(([val, label, icon]) => (
            <button
              key={val}
              onClick={() => { setSelected(val); setError('') }}
              style={{
                background: selected === val ? '#1A3060' : '#0F1E38',
                border: `1px solid ${selected === val ? '#C9A84C' : '#1A3060'}`,
                borderRadius: '8px',
                padding: '1rem',
                color: selected === val ? '#C9A84C' : '#8A9AB8',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: selected === val ? 600 : 400,
              }}
            >
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{icon}</div>
              {label}
            </button>
          ))}
        </div>

        {error && <p style={{ color: '#FF6B6B', fontSize: '0.8rem', marginBottom: '0.75rem' }}>{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={loading}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, #C9A84C, #8A6A20)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? '...' : 'متابعة ←'}
        </button>
      </div>
    </div>
  )
}
