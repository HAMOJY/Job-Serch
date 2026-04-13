'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerSchema, RegisterInput } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

type Role = 'job_seeker' | 'recruiter'

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as Role | '',
    phone: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setServerError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = registerSchema.safeParse(form)
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
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { name: form.name, role: form.role },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)

    if (error) {
      if (error.message?.includes('already registered')) {
        setServerError('هذا البريد مستخدم، جرّب تسجيل الدخول')
      } else {
        setServerError('حدث خطأ، يرجى المحاولة مجدداً')
      }
      return
    }

    setSuccess(true)
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

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📧</div>
        <h2 style={{ color: '#E8EAF0', marginBottom: '0.5rem' }}>تحقق من بريدك الإلكتروني</h2>
        <p style={{ color: '#8A9AB8', fontSize: '0.9rem' }}>
          أرسلنا لك رابط التفعيل. يمكنك تصفح الموقع في هذه الأثناء.
        </p>
        <button
          onClick={() => router.push('/analyze')}
          style={{
            marginTop: '1.25rem',
            background: 'linear-gradient(135deg, #C9A84C, #8A6A20)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.625rem 1.5rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          ابدأ الاستخدام ←
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label htmlFor="name" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          الاسم الكامل
        </label>
        <input id="name" name="name" value={form.name} onChange={handleChange} style={inputStyle} />
        {errors.name && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="email" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          البريد الإلكتروني
        </label>
        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} style={inputStyle} dir="ltr" />
        {errors.email && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          كلمة المرور
        </label>
        <input id="password" name="password" type="password" value={form.password} onChange={handleChange} style={inputStyle} />
        {errors.password && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.password}</p>}
      </div>

      <div>
        <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>نوع الحساب</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {([['job_seeker', 'باحث عن عمل', '🔍'], ['recruiter', 'مسؤول توظيف', '🏢']] as const).map(([val, label, icon]) => (
            <button
              key={val}
              type="button"
              onClick={() => { setForm((p) => ({ ...p, role: val })); setErrors((p) => ({ ...p, role: '' })) }}
              style={{
                background: form.role === val ? '#1A3060' : '#0F1E38',
                border: `1px solid ${form.role === val ? '#C9A84C' : '#1A3060'}`,
                borderRadius: '8px',
                padding: '0.75rem',
                color: form.role === val ? '#C9A84C' : '#8A9AB8',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: form.role === val ? 600 : 400,
              }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
        {errors.role && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors.role}</p>}
      </div>

      <div>
        <label htmlFor="phone" style={{ display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }}>
          رقم الهاتف <span style={{ color: '#4A5A78' }}>(اختياري)</span>
        </label>
        <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} style={inputStyle} dir="ltr" />
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
        {loading ? '...' : 'إنشاء حساب'}
      </button>
    </form>
  )
}
