'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ScoredJob } from '@/app/api/jobs/search/route'

interface Props {
  hasAnalysis: boolean
  detectedRole: string | null
  keySkills: string[]
  cvScore: number | null
  userName: string | null
}

const COUNTRIES = [
  { code: 'ae', label: '🇦🇪 الإمارات' },
  { code: 'sa', label: '🇸🇦 السعودية' },
  { code: 'gb', label: '🇬🇧 المملكة المتحدة' },
  { code: 'us', label: '🇺🇸 الولايات المتحدة' },
]

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 75 ? '#22c55e' : score >= 50 ? '#C9A84C' : '#6b7280'
  const label =
    score >= 75 ? 'تطابق ممتاز' : score >= 50 ? 'تطابق جيد' : 'تطابق ضعيف'
  return (
    <span
      style={{
        background: color + '22',
        color,
        border: `1px solid ${color}44`,
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '2px 10px',
      }}
    >
      {score}% — {label}
    </span>
  )
}

function JobCard({
  job,
  onCoverLetter,
}: {
  job: ScoredJob
  onCoverLetter: (job: ScoredJob) => void
}) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      style={{
        background: '#0A1628',
        border: '1px solid #1A3060',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '0.75rem',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#E8EAF0', fontSize: '1rem', fontWeight: 700, margin: 0 }}>
            {job.title}
          </h3>
          <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: '4px 0 0' }}>
            {job.company} · {job.location}
          </p>
        </div>
        <MatchBadge score={job.match_score} />
      </div>

      {/* Match reasons */}
      {job.match_reasons.length > 0 && (
        <ul style={{ margin: '0.75rem 0 0', padding: '0 1rem', color: '#8A9AB8', fontSize: '0.82rem' }}>
          {job.match_reasons.map((r, i) => (
            <li key={i} style={{ marginBottom: '2px' }}>
              {r}
            </li>
          ))}
        </ul>
      )}

      {/* Description toggle */}
      {job.description && (
        <div style={{ marginTop: '0.75rem' }}>
          <p
            style={{
              color: '#6A7A98',
              fontSize: '0.82rem',
              lineHeight: 1.6,
              overflow: 'hidden',
              maxHeight: expanded ? 'none' : '3.5rem',
              direction: 'ltr',
              textAlign: 'left',
            }}
          >
            {job.description}
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ color: '#4A5A78', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}
          >
            {expanded ? 'أقل ▲' : 'المزيد ▼'}
          </button>
        </div>
      )}

      {/* Salary */}
      {(job.salary_min || job.salary_max) && (
        <p style={{ color: '#C9A84C', fontSize: '0.82rem', marginTop: '0.5rem' }}>
          💰{' '}
          {job.salary_min && job.salary_max
            ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}`
            : job.salary_min?.toLocaleString() ?? job.salary_max?.toLocaleString()}
        </p>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <a
          href={job.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #A07830)',
            color: '#fff',
            borderRadius: '8px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          تقدّم الآن ↗
        </a>
        <button
          onClick={() => onCoverLetter(job)}
          style={{
            background: '#1A3060',
            color: '#C9A84C',
            border: '1px solid #2A4080',
            borderRadius: '8px',
            padding: '6px 16px',
            fontSize: '0.82rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✍️ خطاب تقديم
        </button>
      </div>
    </div>
  )
}

function CoverLetterModal({
  job,
  onClose,
}: {
  job: ScoredJob
  onClose: () => void
}) {
  const [letter, setLetter] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setLetter('')
    try {
      const res = await fetch('/api/jobs/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          job_description: job.description,
          language,
        }),
      })
      const data = await res.json()
      setLetter(data.cover_letter ?? data.error ?? 'حدث خطأ')
    } catch {
      setLetter('حدث خطأ في الاتصال')
    } finally {
      setLoading(false)
    }
  }

  function copy() {
    navigator.clipboard.writeText(letter)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#0A1628',
          border: '1px solid #1A3060',
          borderRadius: '16px',
          padding: '1.5rem',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '85vh',
          overflow: 'auto',
          direction: 'rtl',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ color: '#E8EAF0', fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
            ✍️ خطاب تقديم — {job.title}
          </h2>
          <button onClick={onClose} style={{ color: '#4A5A78', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>

        <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {job.company} · {job.location}
        </p>

        {/* Language toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {(['ar', 'en'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                background: language === lang ? '#1A3060' : 'transparent',
                color: language === lang ? '#C9A84C' : '#4A5A78',
                border: `1px solid ${language === lang ? '#2A4080' : '#1A3060'}`,
                borderRadius: '8px',
                padding: '4px 14px',
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {lang === 'ar' ? 'عربي' : 'English'}
            </button>
          ))}
        </div>

        <button
          onClick={generate}
          disabled={loading}
          style={{
            background: 'linear-gradient(135deg, #C9A84C, #A07830)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 24px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            width: '100%',
            marginBottom: '1rem',
          }}
        >
          {loading ? '⏳ جاري الإنشاء...' : '🪄 إنشاء الخطاب بالذكاء الاصطناعي'}
        </button>

        {letter && (
          <>
            <textarea
              readOnly
              value={letter}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
              style={{
                width: '100%',
                minHeight: '220px',
                background: '#060D1A',
                border: '1px solid #1A3060',
                borderRadius: '8px',
                color: '#E8EAF0',
                fontSize: '0.88rem',
                lineHeight: 1.8,
                padding: '1rem',
                resize: 'vertical',
                boxSizing: 'border-box',
                fontFamily: 'sans-serif',
                textAlign: language === 'ar' ? 'right' : 'left',
              }}
            />
            <button
              onClick={copy}
              style={{
                marginTop: '0.75rem',
                background: copied ? '#22c55e22' : '#1A3060',
                color: copied ? '#22c55e' : '#C9A84C',
                border: `1px solid ${copied ? '#22c55e44' : '#2A4080'}`,
                borderRadius: '8px',
                padding: '8px 20px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {copied ? '✓ تم النسخ!' : '📋 نسخ الخطاب'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function JobsClient({ hasAnalysis, detectedRole, keySkills, cvScore, userName }: Props) {
  const [jobs, setJobs] = useState<ScoredJob[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [country, setCountry] = useState('ae')
  const [error, setError] = useState('')
  const [coverLetterJob, setCoverLetterJob] = useState<ScoredJob | null>(null)
  const [roleDisplay, setRoleDisplay] = useState(detectedRole ?? '')

  async function search() {
    setLoading(true)
    setError('')
    setJobs([])
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'حدث خطأ')
      } else {
        setJobs(data.jobs ?? [])
        setRoleDisplay(data.role ?? detectedRole ?? '')
        setSearched(true)
      }
    } catch {
      setError('تعذّر الاتصال بالخادم')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060D1A',
        padding: '1.5rem 1rem',
        direction: 'rtl',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link href="/dashboard" style={{ color: '#4A5A78', fontSize: '0.82rem', textDecoration: 'none' }}>
            ← لوحة التحكم
          </Link>
          <h1 style={{ color: '#E8EAF0', fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>
            🔍 وظائف تناسبك
          </h1>
          {userName && (
            <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: 0 }}>
              مرحباً {userName} — نبحث لك عن أفضل الفرص
            </p>
          )}
        </div>

        {/* No analysis guard */}
        {!hasAnalysis ? (
          <div
            style={{
              background: '#0A1628',
              border: '1px solid #1A3060',
              borderRadius: '16px',
              padding: '2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.75rem' }}>📄</p>
            <h2 style={{ color: '#E8EAF0', fontSize: '1.1rem', fontWeight: 700 }}>
              ابدأ بتحليل سيرتك الذاتية
            </h2>
            <p style={{ color: '#8A9AB8', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>
              لمطابقة وظائف مناسبة لك يجب أن تحلل سيرتك الذاتية أولاً.
            </p>
            <Link
              href="/analyze"
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #A07830)',
                color: '#fff',
                borderRadius: '10px',
                padding: '10px 28px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              تحليل سيرتي الذاتية
            </Link>
          </div>
        ) : (
          <>
            {/* CV Summary chip */}
            <div
              style={{
                background: '#0A1628',
                border: '1px solid #1A3060',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.5rem',
                alignItems: 'center',
              }}
            >
              <span style={{ color: '#8A9AB8', fontSize: '0.85rem', marginLeft: 'auto' }}>
                📊 نقاطك: <strong style={{ color: '#C9A84C' }}>{cvScore}/100</strong>
              </span>
              <span style={{ color: '#8A9AB8', fontSize: '0.85rem' }}>
                🎯 مجالك: <strong style={{ color: '#E8EAF0' }}>{detectedRole}</strong>
              </span>
              {keySkills.slice(0, 4).map((s) => (
                <span
                  key={s}
                  style={{
                    background: '#1A3060',
                    color: '#8A9AB8',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    padding: '2px 10px',
                  }}
                >
                  {s}
                </span>
              ))}
            </div>

            {/* Search controls */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => setCountry(c.code)}
                  style={{
                    background: country === c.code ? '#1A3060' : 'transparent',
                    color: country === c.code ? '#C9A84C' : '#4A5A78',
                    border: `1px solid ${country === c.code ? '#2A4080' : '#1A3060'}`,
                    borderRadius: '8px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    fontWeight: country === c.code ? 700 : 400,
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <button
              onClick={search}
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #C9A84C, #A07830)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontWeight: 800,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                width: '100%',
                marginBottom: '1.5rem',
              }}
            >
              {loading ? '⏳ جاري البحث والتقييم بالذكاء الاصطناعي...' : '🔍 ابحث عن وظائف مناسبة'}
            </button>

            {error && (
              <div
                style={{
                  background: '#ff444422',
                  border: '1px solid #ff444444',
                  borderRadius: '10px',
                  padding: '1rem',
                  color: '#ff8888',
                  marginBottom: '1rem',
                  fontSize: '0.88rem',
                }}
              >
                {error}
              </div>
            )}

            {/* Results */}
            {searched && jobs.length === 0 && !error && (
              <div style={{ textAlign: 'center', color: '#4A5A78', padding: '2rem' }}>
                <p style={{ fontSize: '2rem' }}>🔍</p>
                <p>لم نجد وظائف متاحة في هذا البلد حالياً. جرّب دولة أخرى.</p>
              </div>
            )}

            {jobs.length > 0 && (
              <>
                <p style={{ color: '#4A5A78', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  {jobs.length} وظيفة مرتبة حسب التطابق مع ملفك — مجال: <strong>{roleDisplay}</strong>
                </p>
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onCoverLetter={setCoverLetterJob} />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Cover letter modal */}
      {coverLetterJob && (
        <CoverLetterModal job={coverLetterJob} onClose={() => setCoverLetterJob(null)} />
      )}
    </div>
  )
}
