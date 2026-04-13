'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetPasswordSchema } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = resetPasswordSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        fieldErrors[issue.path[0] as string] = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    setLoading(true)
    const supabase = createBrowserSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)

    if (error) {
      setServerError('حدث خطأ، يرجى طلب رابط جديد')
      return
    }

    router.replace('/auth/login?reset=success')
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
        <h1 style={{ color: '#E8EAF0', fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center' }}>
          تعيين كلمة مرور جديدة
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
          <div>
            <label htmlFor="password" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
              كلمة المرور الجديدة
            </label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} style={inputStyle} />
            {errors.password && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
              تأكيد كلمة المرور
            </label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} style={inputStyle} />
            {errors.confirmPassword && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>}
          </div>

          {serverError && <p style={{ color: '#FF6B6B', fontSize: '0.85rem', textAlign: 'center' }}>{serverError}</p>}

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
            {loading ? '...' : 'حفظ كلمة المرور'}
          </button>
        </form>
      </div>
    </div>
  )
}
