'use client'

import { useState } from 'react'
import { updateProfileSchema, UpdateProfileInput } from '@/lib/auth-validation'
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

interface Profile {
  id: string
  name: string
  job_title: string | null
  location: string | null
  bio: string | null
  linkedin_url: string | null
  github_url: string | null
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [form, setForm] = useState<UpdateProfileInput>({
    name: profile.name,
    job_title: profile.job_title ?? '',
    location: profile.location ?? '',
    bio: profile.bio ?? '',
    linkedin_url: profile.linkedin_url ?? '',
    github_url: profile.github_url ?? '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }))
    setSaved(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const result = updateProfileSchema.safeParse(form)
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
    await supabase.from('profiles').update(result.data).eq('id', profile.id)
    setLoading(false)
    setSaved(true)
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

  const labelStyle = { display: 'block', color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.375rem' }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {[
        { id: 'name', label: 'الاسم الكامل', type: 'text' },
        { id: 'job_title', label: 'المسمى الوظيفي', type: 'text' },
        { id: 'location', label: 'الموقع', type: 'text' },
        { id: 'linkedin_url', label: 'رابط LinkedIn', type: 'url', dir: 'ltr' },
        { id: 'github_url', label: 'رابط GitHub', type: 'url', dir: 'ltr' },
      ].map(({ id, label, type, dir }) => (
        <div key={id}>
          <label htmlFor={id} style={labelStyle}>{label}</label>
          <input
            id={id}
            name={id}
            type={type}
            value={(form as Record<string, string>)[id] ?? ''}
            onChange={handleChange}
            style={inputStyle}
            dir={dir as 'ltr' | undefined}
          />
          {errors[id] && <p style={{ color: '#FF6B6B', fontSize: '0.75rem', marginTop: '0.25rem' }}>{errors[id]}</p>}
        </div>
      ))}

      <div>
        <label htmlFor="bio" style={labelStyle}>نبذة عني</label>
        <textarea
          id="bio"
          name="bio"
          value={form.bio ?? ''}
          onChange={handleChange}
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
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
        {loading ? '...' : saved ? '✓ تم الحفظ' : 'حفظ التغييرات'}
      </button>
    </form>
  )
}
