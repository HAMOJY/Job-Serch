'use client'

import { useState } from 'react'
import Link from 'next/link'
import { forgotPasswordSchema } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error: supabaseError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setLoading(false)

    if (supabaseError) {
      setError('حدث خطأ، يرجى المحاولة مجدداً')
      return
    }

    setSent(true)
  }

  const inputStyle = {
    width: '100%',
    padding: '0.625rem 0.875rem',
    background: '#0F1E38',
    border: '1px solid #1A3060',
    borderRadius: '8px',
    color: '#E8EAF0',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#060D1A',
      padding: '1rem',
    }}>
      <div style={{
        background: '#0A1628',
        border: '1px solid #1A3060',
        borderRadius: '16px',
        padding: '2rem',
        width: '100%',
        maxWidth: '420px',
        direction: 'rtl',
        fontFamily: 'sans-serif',
      }}>
        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
            <h2 style={{ color: '#E8EAF0', marginBottom: '0.5rem' }}>تحقق من بريدك</h2>
            <p style={{ color: '#8A9AB8', fontSize: '0.9rem' }}>
              أرسلنا رابط إعادة تعيين كلمة المرور إلى {email}
            </p>
            <Link href="/auth/login" style={{ display: 'block', marginTop: '1.25rem', color: '#C9A84C', fontSize: '0.9rem' }}>
              العودة لتسجيل الدخول
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ color: '#E8EAF0', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
              نسيت كلمة المرور؟
            </h1>
            <p style={{ color: '#8A9AB8', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              أدخل بريدك وسنرسل لك رابط الاستعادة
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label htmlFor="email" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError('') }}
                  style={inputStyle}
                  dir="ltr"
                />
                {error && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{error}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
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
                {loading ? '...' : 'إرسال رابط الاستعادة'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link href="/auth/login" style={{ color: '#4A5A78', fontSize: '0.85rem' }}>
                العودة لتسجيل الدخول
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
