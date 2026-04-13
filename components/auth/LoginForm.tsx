'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginSchema, LoginInput } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState<LoginInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<Partial<Record<keyof LoginInput, string>>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }))
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = loginSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof LoginInput
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })
    setLoading(false)

    if (error) {
      setServerError('البريد أو كلمة المرور غير صحيحة')
      return
    }

    const rawNext = searchParams.get('next') ?? '/analyze'
    // Only follow relative paths — block external redirects like https://evil.com or //evil.com
    const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/analyze'
    router.replace(next)
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
    direction: 'rtl' as const,
    boxSizing: 'border-box' as const,
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="email" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          style={inputStyle}
          autoComplete="email"
          dir="ltr"
        />
        {errors.email && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          style={inputStyle}
          autoComplete="current-password"
        />
        {errors.password && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
      </div>

      {serverError && (
        <p style={{ color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center' }}>{serverError}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'linear-gradient(135deg, #C9A84C, #8A6A20)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.75rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? '...' : 'تسجيل الدخول'}
      </button>
    </form>
  )
}
