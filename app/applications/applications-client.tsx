'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Application {
  id: string
  job_title: string
  company: string
  job_location: string | null
  job_url: string | null
  status: string
  created_at: string
  applied_at: string | null
  notes: string | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  prepared:  { label: 'جاهز للتقديم', color: '#C9A84C', emoji: '📋' },
  emailed:   { label: 'أُرسل بالإيميل', color: '#00D4FF', emoji: '📧' },
  applied:   { label: 'تم التقديم',    color: '#22c55e', emoji: '✅' },
  interview: { label: 'مقابلة',        color: '#a855f7', emoji: '🎤' },
  rejected:  { label: 'مرفوض',        color: '#ff6b6b', emoji: '❌' },
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? { label: status, color: '#4A5A78', emoji: '•' }
  return (
    <span style={{ background: cfg.color + '22', color: cfg.color, border: `1px solid ${cfg.color}44`, borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, padding: '3px 12px' }}>
      {cfg.emoji} {cfg.label}
    </span>
  )
}

function ApplicationCard({ app, onStatusChange }: { app: Application; onStatusChange: (id: string, status: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: '#0A1628', border: '1px solid #1A3060', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#E8EAF0', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{app.job_title}</h3>
          <p style={{ color: '#8A9AB8', fontSize: '0.82rem', margin: '3px 0 0' }}>
            {app.company}{app.job_location ? ` · ${app.job_location}` : ''}
          </p>
        </div>
        <StatusBadge status={app.status} />
      </div>

      <p style={{ color: '#4A5A78', fontSize: '0.75rem', margin: '0.5rem 0 0' }}>
        أُنشئ: {new Date(app.created_at).toLocaleDateString('ar-EG')}
        {app.applied_at && ` · طُبِّق: ${new Date(app.applied_at).toLocaleDateString('ar-EG')}`}
      </p>

      {/* Status changer */}
      <div style={{ marginTop: '0.75rem' }}>
        <button onClick={() => setOpen(!open)} style={{ color: '#4A5A78', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          {open ? 'إخفاء ▲' : 'تحديث الحالة ▼'}
        </button>
        {open && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
            {Object.entries(STATUS_CONFIG).map(([key, { label, color }]) => (
              <button
                key={key}
                onClick={() => { onStatusChange(app.id, key); setOpen(false) }}
                style={{
                  background: app.status === key ? color + '22' : 'transparent',
                  color: app.status === key ? color : '#4A5A78',
                  border: `1px solid ${app.status === key ? color + '55' : '#1A3060'}`,
                  borderRadius: '999px', padding: '3px 12px', fontSize: '0.75rem', cursor: 'pointer',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {app.job_url && (
        <a href={app.job_url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-block', marginTop: '0.75rem', color: '#C9A84C', fontSize: '0.8rem', textDecoration: 'none' }}>
          عرض الوظيفة ↗
        </a>
      )}
    </div>
  )
}

export default function ApplicationsClient({ applications }: { applications: Application[] }) {
  const [apps, setApps] = useState(applications)
  const [filter, setFilter] = useState<string>('all')

  async function handleStatusChange(id: string, status: string) {
    setApps(prev => prev.map(a => a.id === id ? { ...a, status, applied_at: (status === 'applied' || status === 'emailed') ? new Date().toISOString() : a.applied_at } : a))
    await fetch('/api/jobs/save-application', {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
  }

  const filtered = filter === 'all' ? apps : apps.filter(a => a.status === filter)

  // Stats
  const stats = Object.keys(STATUS_CONFIG).map(key => ({
    key, count: apps.filter(a => a.status === key).length, ...STATUS_CONFIG[key],
  }))

  return (
    <div style={{ minHeight: '100vh', background: '#060D1A', padding: '1.5rem 1rem', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/jobs" style={{ color: '#4A5A78', fontSize: '0.82rem', textDecoration: 'none' }}>← البحث عن وظائف</Link>
            <Link href="/dashboard" style={{ color: '#4A5A78', fontSize: '0.82rem', textDecoration: 'none' }}>لوحة التحكم ←</Link>
          </div>
          <h1 style={{ color: '#E8EAF0', fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>📋 طلباتي</h1>
          <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: 0 }}>{apps.length} طلب تقديم — تتبع حالة كل طلب من هنا</p>
        </div>

        {/* Stats */}
        {apps.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', marginBottom: '1.25rem' }}>
            {stats.map(s => (
              <div key={s.key} style={{ background: '#0A1628', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.7rem', color: '#4A5A78', marginTop: '2px' }}>{s.emoji} {s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Filter */}
        {apps.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            <button onClick={() => setFilter('all')}
              style={{ background: filter === 'all' ? '#1A3060' : 'transparent', color: filter === 'all' ? '#C9A84C' : '#4A5A78', border: `1px solid ${filter === 'all' ? '#2A4080' : '#1A3060'}`, borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
              الكل ({apps.length})
            </button>
            {stats.filter(s => s.count > 0).map(s => (
              <button key={s.key} onClick={() => setFilter(s.key)}
                style={{ background: filter === s.key ? s.color + '22' : 'transparent', color: filter === s.key ? s.color : '#4A5A78', border: `1px solid ${filter === s.key ? s.color + '55' : '#1A3060'}`, borderRadius: '8px', padding: '5px 14px', fontSize: '0.8rem', cursor: 'pointer' }}>
                {s.emoji} {s.label} ({s.count})
              </button>
            ))}
          </div>
        )}

        {/* Empty state */}
        {apps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', background: '#0A1628', border: '1px solid #1A3060', borderRadius: '16px' }}>
            <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>📭</p>
            <h2 style={{ color: '#E8EAF0', fontSize: '1.1rem', fontWeight: 700 }}>لم تبدأ بالتقديم بعد</h2>
            <p style={{ color: '#8A9AB8', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>ابحث عن وظائف واستخدم التقديم الذكي لإنشاء حزمة تقديم احترافية.</p>
            <Link href="/jobs" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', borderRadius: '10px', padding: '10px 28px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              🔍 ابحث عن وظائف
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4A5A78', padding: '2rem' }}>لا توجد طلبات بهذا الفلتر</p>
        ) : (
          filtered.map(app => <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} />)
        )}
      </div>
    </div>
  )
}
