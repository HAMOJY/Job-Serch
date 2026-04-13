'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function DeleteAccountDialog() {
  const router = useRouter()
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleDelete() {
    if (confirm !== 'احذف حسابي') return
    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'transparent',
          color: '#FF6B6B',
          border: '1px solid #FF6B6B',
          borderRadius: '8px',
          padding: '0.625rem 1.25rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        حذف الحساب
      </button>
    )
  }

  return (
    <div style={{
      background: '#1A0A0A',
      border: '1px solid #FF6B6B44',
      borderRadius: '12px',
      padding: '1.25rem',
    }}>
      <h3 style={{ color: '#FF6B6B', marginBottom: '0.5rem' }}>حذف الحساب نهائياً</h3>
      <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '1rem' }}>
        هذا الإجراء لا يمكن التراجع عنه. اكتب <strong style={{ color: '#E8EAF0' }}>احذف حسابي</strong> للتأكيد.
      </p>
      <input
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        placeholder="احذف حسابي"
        style={{
          width: '100%',
          padding: '0.625rem 0.875rem',
          background: '#0F1E38',
          border: '1px solid #FF6B6B44',
          borderRadius: '8px',
          color: '#E8EAF0',
          fontSize: '0.9rem',
          outline: 'none',
          boxSizing: 'border-box' as const,
          marginBottom: '0.75rem',
          direction: 'rtl',
        }}
      />
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleDelete}
          disabled={confirm !== 'احذف حسابي' || loading}
          style={{
            background: '#FF6B6B',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.625rem 1rem',
            cursor: confirm !== 'احذف حسابي' ? 'not-allowed' : 'pointer',
            opacity: confirm !== 'احذف حسابي' ? 0.5 : 1,
            fontWeight: 600,
          }}
        >
          {loading ? '...' : 'تأكيد الحذف'}
        </button>
        <button
          onClick={() => { setOpen(false); setConfirm('') }}
          style={{
            background: '#162440',
            color: '#8A9AB8',
            border: '1px solid #1A3060',
            borderRadius: '8px',
            padding: '0.625rem 1rem',
            cursor: 'pointer',
          }}
        >
          إلغاء
        </button>
      </div>
    </div>
  )
}
