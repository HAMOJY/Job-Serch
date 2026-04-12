'use client'

import { useState } from 'react'
import type { WaitlistInput } from '@/lib/validation'

interface Props {
  onSuccess?: () => void
}

type FormState = {
  name: string
  email: string
  phone: string
  role: WaitlistInput['role'] | ''
}

export default function WaitlistForm({ onSuccess }: Props) {
  const [form, setForm] = useState<FormState>({
    name: '', email: '', phone: '', role: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'حدث خطأ، يرجى المحاولة مجدداً')
        return
      }
      setSuccess(true)
      onSuccess?.()
    } catch {
      setError('حدث خطأ في الاتصال، يرجى المحاولة مجدداً')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="form-success">
        <div className="success-icon">✅</div>
        <h3>تم التسجيل بنجاح!</h3>
        <p>سنتواصل معك قريباً عند إطلاق المنصة.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="waitlist-form" dir="rtl">
      <input
        type="text"
        placeholder="الاسم الكامل"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        required
        className="waitlist-input"
      />
      <input
        type="email"
        placeholder="البريد الإلكتروني"
        value={form.email}
        onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        required
        className="waitlist-input"
      />
      <input
        type="tel"
        placeholder="رقم الهاتف"
        value={form.phone}
        onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        required
        className="waitlist-input"
      />
      <div className="radio-group">
        <label className="radio-label">
          <input
            type="radio"
            name="role"
            value="job_seeker"
            checked={form.role === 'job_seeker'}
            onChange={() => setForm(f => ({ ...f, role: 'job_seeker' }))}
            aria-label="باحث عن عمل"
          />
          <span>باحث عن عمل</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name="role"
            value="recruiter"
            checked={form.role === 'recruiter'}
            onChange={() => setForm(f => ({ ...f, role: 'recruiter' }))}
            aria-label="شركة / مسؤول توظيف"
          />
          <span>شركة / مسؤول توظيف</span>
        </label>
      </div>
      {error && <div className="form-error">{error}</div>}
      <button
        type="submit"
        className="btn-primary"
        disabled={loading}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {loading ? 'جاري التسجيل...' : 'سجّل الآن مجاناً ←'}
      </button>
    </form>
  )
}
