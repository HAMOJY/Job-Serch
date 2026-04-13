'use client'

import { useState } from 'react'
import { resetPasswordSchema } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

export default function SecurityForm({ isOAuthUser }: { isOAuthUser: boolean }) {
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  if (isOAuthUser) {
    return (
      <div style={{ color: '#8A9AB8', fontSize: '0.9rem', padding: '1rem 0' }}>
        حسابك مرتبط بتسجيل الدخول الاجتماعي (Google / LinkedIn). لا يمكن تغيير كلمة المرور.
      </div>
    )
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
    const { error: updateError } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)
    if (updateError) {
      setErrors({ password: 'حدث خطأ، يرجى المحاولة مجدداً' })
      return
    }
    setSaved(true)
    setForm({ password: '', confirmPassword: '' })
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
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="sec-password" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          كلمة المرور الجديدة
        </label>
        <input id="sec-password" name="password" type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} style={inputStyle} />
        {errors.password && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="sec-confirm" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          تأكيد كلمة المرور
        </label>
        <input id="sec-confirm" name="confirmPassword" type="password" value={form.confirmPassword} onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))} style={inputStyle} />
        {errors.confirmPassword && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.confirmPassword}</p>}
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
        {loading ? '...' : saved ? '✓ تم تغيير كلمة المرور' : 'تغيير كلمة المرور'}
      </button>
    </form>
  )
}
