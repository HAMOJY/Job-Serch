'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ScoredJob } from '@/app/api/jobs/search/route'
import type { ApplyPackage, QAAnswer } from '@/app/api/jobs/apply-package/route'

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

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  prepared: { label: 'جاهز للتقديم', color: '#C9A84C' },
  emailed: { label: 'تم إرسال الإيميل', color: '#00D4FF' },
  applied: { label: 'تم التقديم', color: '#22c55e' },
  interview: { label: 'مقابلة', color: '#a855f7' },
  rejected: { label: 'مرفوض', color: '#ff6b6b' },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function useCopy(timeout = 2000) {
  const [copied, setCopied] = useState<string | null>(null)
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), timeout)
  }
  return { copied, copy }
}

// ── Match Badge ────────────────────────────────────────────────────────────

function MatchBadge({ score }: { score: number }) {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#C9A84C' : '#6b7280'
  const label = score >= 75 ? 'تطابق ممتاز' : score >= 50 ? 'تطابق جيد' : 'تطابق ضعيف'
  return (
    <span style={{ background: color + '22', color, border: `1px solid ${color}44`, borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, padding: '2px 10px' }}>
      {score}% — {label}
    </span>
  )
}

// ── Smart Apply Modal ──────────────────────────────────────────────────────

function SmartApplyModal({ job, onClose }: { job: ScoredJob; onClose: () => void }) {
  const [step, setStep] = useState<'config' | 'loading' | 'result'>('config')
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [pkg, setPkg] = useState<ApplyPackage | null>(null)
  const [activeTab, setActiveTab] = useState<'letter' | 'qa' | 'email' | 'linkedin'>('letter')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedId, setSavedId] = useState<string | null>(null)
  const [appStatus, setAppStatus] = useState('prepared')
  const { copied, copy } = useCopy()

  async function generate() {
    setStep('loading')
    setError('')
    try {
      const res = await fetch('/api/jobs/apply-package', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          job_location: job.location,
          job_description: job.description,
          job_url: job.url,
          language,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'حدث خطأ'); setStep('config'); return }
      setPkg(data)
      setStep('result')
      // Auto-save
      saveApplication(data, 'prepared')
    } catch {
      setError('تعذّر الاتصال')
      setStep('config')
    }
  }

  async function saveApplication(data: ApplyPackage, status: string) {
    setSaving(true)
    try {
      const res = await fetch('/api/jobs/save-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_title: job.title,
          company: job.company,
          job_location: job.location,
          job_url: job.url,
          job_description: job.description,
          cover_letter: data.cover_letter,
          qa_answers: data.qa_answers,
          email_subject: data.email_subject,
          email_body: data.email_body,
          linkedin_message: data.linkedin_message,
          status,
        }),
      })
      const saved = await res.json()
      if (saved.id) setSavedId(saved.id)
    } catch { /* silent */ }
    setSaving(false)
  }

  async function markStatus(status: string) {
    setAppStatus(status)
    if (savedId) {
      await fetch('/api/jobs/save-application', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedId, status }),
      })
    }
  }

  const tabBtn = (key: typeof activeTab, label: string) => (
    <button
      key={key}
      onClick={() => setActiveTab(key)}
      style={{
        padding: '0.45rem 0.9rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
        fontSize: '0.82rem', fontWeight: 600, fontFamily: 'sans-serif',
        background: activeTab === key ? 'rgba(201,168,76,0.18)' : 'transparent',
        color: activeTab === key ? '#C9A84C' : '#4A5A78',
      }}
    >
      {label}
    </button>
  )

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ background: '#0A1628', border: '1px solid #1A3060', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '680px', maxHeight: '90vh', overflow: 'auto', direction: 'rtl', fontFamily: 'sans-serif' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ color: '#E8EAF0', fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>🤖 تقديم ذكي</h2>
            <p style={{ color: '#8A9AB8', fontSize: '0.82rem', margin: '4px 0 0' }}>{job.title} · {job.company}</p>
          </div>
          <button onClick={onClose} style={{ color: '#4A5A78', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem' }}>✕</button>
        </div>

        {/* ── Step: Config ── */}
        {step === 'config' && (
          <div>
            <div style={{ background: '#060D1A', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <p style={{ color: '#C9A84C', fontWeight: 700, margin: '0 0 0.5rem' }}>🪄 الذكاء الاصطناعي سيولّد لك:</p>
              {[
                '📄 خطاب تقديم مخصص لهذه الوظيفة تحديداً',
                '💬 إجابات جاهزة على أسئلة المقابلة الشائعة',
                '📧 إيميل تقديم احترافي جاهز للإرسال',
                '🔗 رسالة LinkedIn للتواصل مع المسؤول عن التوظيف',
              ].map((item, i) => (
                <p key={i} style={{ color: '#8A9AB8', margin: '0.3rem 0' }}>{item}</p>
              ))}
            </div>

            <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.5rem' }}>لغة الحزمة:</p>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {(['ar', 'en'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  style={{
                    background: language === lang ? '#1A3060' : 'transparent',
                    color: language === lang ? '#C9A84C' : '#4A5A78',
                    border: `1px solid ${language === lang ? '#2A4080' : '#1A3060'}`,
                    borderRadius: '8px', padding: '6px 18px', fontSize: '0.85rem', cursor: 'pointer', fontWeight: language === lang ? 700 : 400,
                  }}
                >
                  {lang === 'ar' ? '🇸🇦 عربي' : '🇬🇧 English'}
                </button>
              ))}
            </div>

            {error && <p style={{ color: '#ff8888', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</p>}

            <button
              onClick={generate}
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', border: 'none', borderRadius: '12px', padding: '13px 0', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', width: '100%', fontFamily: 'sans-serif' }}
            >
              🤖 توليد حزمة التقديم الكاملة
            </button>
          </div>
        )}

        {/* ── Step: Loading ── */}
        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚙️</div>
            <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '1rem' }}>الذكاء الاصطناعي يحلل الوظيفة ويكتب حزمتك...</p>
            <p style={{ color: '#4A5A78', fontSize: '0.82rem', marginTop: '0.5rem' }}>يستغرق 10-20 ثانية</p>
          </div>
        )}

        {/* ── Step: Result ── */}
        {step === 'result' && pkg && (
          <div>
            {/* Status tracker */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {Object.entries(STATUS_LABELS).map(([key, { label, color }]) => (
                <button
                  key={key}
                  onClick={() => markStatus(key)}
                  style={{
                    background: appStatus === key ? color + '22' : 'transparent',
                    color: appStatus === key ? color : '#4A5A78',
                    border: `1px solid ${appStatus === key ? color + '55' : '#1A3060'}`,
                    borderRadius: '999px', padding: '3px 12px', fontSize: '0.75rem', cursor: 'pointer', fontWeight: appStatus === key ? 700 : 400,
                  }}
                >
                  {label}
                </button>
              ))}
              {saving && <span style={{ color: '#4A5A78', fontSize: '0.75rem', alignSelf: 'center' }}>حفظ...</span>}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.25rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              {tabBtn('letter', '📄 خطاب التقديم')}
              {tabBtn('qa', '💬 أسئلة وأجوبة')}
              {tabBtn('email', '📧 إيميل جاهز')}
              {tabBtn('linkedin', '🔗 LinkedIn')}
            </div>

            {/* Tab: Cover Letter */}
            {activeTab === 'letter' && (
              <div>
                <textarea
                  defaultValue={pkg.cover_letter}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  style={{ width: '100%', minHeight: '260px', background: '#060D1A', border: '1px solid #1A3060', borderRadius: '10px', color: '#E8EAF0', fontSize: '0.875rem', lineHeight: 1.8, padding: '1rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif', textAlign: language === 'ar' ? 'right' : 'left' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => copy(pkg.cover_letter, 'letter')} style={copyBtnStyle(copied === 'letter')}>
                    {copied === 'letter' ? '✓ تم النسخ' : '📋 نسخ الخطاب'}
                  </button>
                  <a href={job.url} target="_blank" rel="noopener noreferrer" onClick={() => markStatus('applied')} style={applyBtnStyle}>
                    تقدّم الآن ↗
                  </a>
                </div>
              </div>
            )}

            {/* Tab: Q&A */}
            {activeTab === 'qa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pkg.qa_answers.map((qa: QAAnswer, i: number) => (
                  <div key={i} style={{ background: '#060D1A', border: '1px solid #1A3060', borderRadius: '10px', padding: '1rem' }}>
                    <p style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.85rem', margin: '0 0 0.5rem' }}>
                      س{i + 1}: {qa.question}
                    </p>
                    <p style={{ color: '#C8CADB', fontSize: '0.875rem', lineHeight: 1.7, margin: 0, direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                      {qa.answer}
                    </p>
                    <button onClick={() => copy(qa.answer, `qa-${i}`)} style={{ ...copyBtnStyle(copied === `qa-${i}`), marginTop: '0.5rem' }}>
                      {copied === `qa-${i}` ? '✓ تم النسخ' : '📋 نسخ'}
                    </button>
                  </div>
                ))}
                <button onClick={() => copy(pkg.qa_answers.map((q: QAAnswer, i: number) => `س${i + 1}: ${q.question}\nج: ${q.answer}`).join('\n\n'), 'all-qa')}
                  style={copyBtnStyle(copied === 'all-qa')}>
                  {copied === 'all-qa' ? '✓ تم النسخ' : '📋 نسخ الكل'}
                </button>
              </div>
            )}

            {/* Tab: Email */}
            {activeTab === 'email' && (
              <div>
                <div style={{ background: '#060D1A', border: '1px solid #1A3060', borderRadius: '10px', padding: '1rem', marginBottom: '0.75rem' }}>
                  <p style={{ color: '#8A9AB8', fontSize: '0.75rem', margin: '0 0 0.25rem' }}>الموضوع:</p>
                  <p style={{ color: '#E8EAF0', fontWeight: 700, fontSize: '0.9rem', margin: 0 }}>{pkg.email_subject}</p>
                </div>
                <textarea
                  defaultValue={pkg.email_body}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  style={{ width: '100%', minHeight: '220px', background: '#060D1A', border: '1px solid #1A3060', borderRadius: '10px', color: '#E8EAF0', fontSize: '0.875rem', lineHeight: 1.8, padding: '1rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif', textAlign: language === 'ar' ? 'right' : 'left' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <button onClick={() => copy(`${pkg.email_subject}\n\n${pkg.email_body}`, 'email')} style={copyBtnStyle(copied === 'email')}>
                    {copied === 'email' ? '✓ تم النسخ' : '📋 نسخ الإيميل'}
                  </button>
                  <a
                    href={`mailto:hr@${job.company.toLowerCase().replace(/\s+/g, '')}.com?subject=${encodeURIComponent(pkg.email_subject)}&body=${encodeURIComponent(pkg.email_body)}`}
                    onClick={() => markStatus('emailed')}
                    style={applyBtnStyle}
                  >
                    📧 فتح في البريد
                  </a>
                </div>
                <p style={{ color: '#4A5A78', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                  * ابحث عن إيميل HR في الإعلان أو LinkedIn وأرسل إليه مباشرة
                </p>
              </div>
            )}

            {/* Tab: LinkedIn */}
            {activeTab === 'linkedin' && (
              <div>
                <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  أرسل هذه الرسالة لمسؤول التوظيف في <strong style={{ color: '#E8EAF0' }}>{job.company}</strong> على LinkedIn:
                </p>
                <textarea
                  defaultValue={pkg.linkedin_message}
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                  style={{ width: '100%', minHeight: '120px', background: '#060D1A', border: '1px solid #1A3060', borderRadius: '10px', color: '#E8EAF0', fontSize: '0.875rem', lineHeight: 1.8, padding: '1rem', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'sans-serif', textAlign: language === 'ar' ? 'right' : 'left' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <button onClick={() => copy(pkg.linkedin_message, 'linkedin')} style={copyBtnStyle(copied === 'linkedin')}>
                    {copied === 'linkedin' ? '✓ تم النسخ' : '📋 نسخ الرسالة'}
                  </button>
                  <a
                    href={`https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent('HR ' + job.company)}`}
                    target="_blank" rel="noopener noreferrer"
                    style={applyBtnStyle}
                  >
                    🔗 ابحث عن HR في LinkedIn
                  </a>
                </div>
                <div style={{ marginTop: '1.25rem', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '10px', padding: '0.875rem', fontSize: '0.82rem', color: '#8A9AB8' }}>
                  <p style={{ color: '#00D4FF', fontWeight: 700, margin: '0 0 0.4rem' }}>📌 خطوات سريعة:</p>
                  <ol style={{ margin: 0, paddingRight: '1.2rem', lineHeight: 2 }}>
                    <li>ابحث عن مسؤول التوظيف في {job.company} على LinkedIn</li>
                    <li>انقر "Connect" أو "Message"</li>
                    <li>الصق الرسالة المولّدة</li>
                    <li>أرفق أو اذكر اهتمامك بوظيفة {job.title}</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Bottom: Save to Applications */}
            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <p style={{ color: '#4A5A78', fontSize: '0.78rem', margin: 0 }}>
                {savedId ? '✅ محفوظ في طلباتك' : '💾 يُحفظ تلقائياً'}
              </p>
              <Link href="/applications" style={{ color: '#C9A84C', fontSize: '0.82rem', textDecoration: 'none' }}>
                عرض كل طلباتي ←
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Shared button styles ───────────────────────────────────────────────────

function copyBtnStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? '#22c55e22' : '#1A3060',
    color: active ? '#22c55e' : '#C9A84C',
    border: `1px solid ${active ? '#22c55e44' : '#2A4080'}`,
    borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 600, fontFamily: 'sans-serif',
  }
}

const applyBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', borderRadius: '8px', padding: '7px 18px', fontSize: '0.82rem', fontWeight: 700, textDecoration: 'none', display: 'inline-block',
}

// ── Job Card ───────────────────────────────────────────────────────────────

function JobCard({ job, onSmartApply }: { job: ScoredJob; onSmartApply: (job: ScoredJob) => void }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div style={{ background: '#0A1628', border: '1px solid #1A3060', borderRadius: '12px', padding: '1.25rem', marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ color: '#E8EAF0', fontSize: '1rem', fontWeight: 700, margin: 0 }}>{job.title}</h3>
          <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: '4px 0 0' }}>{job.company} · {job.location}</p>
        </div>
        <MatchBadge score={job.match_score} />
      </div>

      {job.match_reasons.length > 0 && (
        <ul style={{ margin: '0.75rem 0 0', padding: '0 1rem', color: '#8A9AB8', fontSize: '0.82rem' }}>
          {job.match_reasons.map((r, i) => <li key={i} style={{ marginBottom: '2px' }}>{r}</li>)}
        </ul>
      )}

      {job.description && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ color: '#6A7A98', fontSize: '0.82rem', lineHeight: 1.6, overflow: 'hidden', maxHeight: expanded ? 'none' : '3.5rem', direction: 'ltr', textAlign: 'left' }}>
            {job.description}
          </p>
          <button onClick={() => setExpanded(!expanded)} style={{ color: '#4A5A78', fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginTop: '4px' }}>
            {expanded ? 'أقل ▲' : 'المزيد ▼'}
          </button>
        </div>
      )}

      {(job.salary_min || job.salary_max) && (
        <p style={{ color: '#C9A84C', fontSize: '0.82rem', marginTop: '0.5rem' }}>
          💰 {job.salary_min && job.salary_max ? `${job.salary_min.toLocaleString()} – ${job.salary_max.toLocaleString()}` : (job.salary_min ?? job.salary_max)?.toLocaleString()}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => onSmartApply(job)}
          style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 18px', fontSize: '0.85rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'sans-serif' }}
        >
          🤖 تقديم ذكي
        </button>
        <a
          href={job.url} target="_blank" rel="noopener noreferrer"
          style={{ background: '#1A3060', color: '#8A9AB8', border: '1px solid #2A4080', borderRadius: '8px', padding: '7px 16px', fontSize: '0.82rem', fontWeight: 600, textDecoration: 'none' }}
        >
          عرض الوظيفة ↗
        </a>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function JobsClient({ hasAnalysis, detectedRole, keySkills, cvScore, userName }: Props) {
  const [jobs, setJobs] = useState<ScoredJob[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [country, setCountry] = useState('ae')
  const [error, setError] = useState('')
  const [applyJob, setApplyJob] = useState<ScoredJob | null>(null)
  const [roleDisplay, setRoleDisplay] = useState(detectedRole ?? '')

  async function search() {
    setLoading(true); setError(''); setJobs([])
    try {
      const res = await fetch('/api/jobs/search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'حدث خطأ') }
      else { setJobs(data.jobs ?? []); setRoleDisplay(data.role ?? detectedRole ?? ''); setSearched(true) }
    } catch { setError('تعذّر الاتصال بالخادم') }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#060D1A', padding: '1.5rem 1rem', direction: 'rtl', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: '#4A5A78', fontSize: '0.82rem', textDecoration: 'none' }}>← لوحة التحكم</Link>
            <Link href="/applications" style={{ color: '#C9A84C', fontSize: '0.82rem', textDecoration: 'none', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '20px', padding: '4px 14px' }}>
              📋 طلباتي
            </Link>
          </div>
          <h1 style={{ color: '#E8EAF0', fontSize: '1.5rem', fontWeight: 800, margin: '0.5rem 0 0.25rem' }}>🔍 وظائف تناسبك</h1>
          {userName && <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: 0 }}>مرحباً {userName} — الذكاء الاصطناعي يبحث ويقدّم نيابةً عنك</p>}
        </div>

        {!hasAnalysis ? (
          <div style={{ background: '#0A1628', border: '1px solid #1A3060', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', margin: '0 0 0.75rem' }}>📄</p>
            <h2 style={{ color: '#E8EAF0', fontSize: '1.1rem', fontWeight: 700 }}>ابدأ بتحليل سيرتك الذاتية</h2>
            <p style={{ color: '#8A9AB8', fontSize: '0.88rem', margin: '0.5rem 0 1.5rem' }}>لمطابقة وظائف وإعداد حزمة تقديم مخصصة، يجب تحليل سيرتك أولاً.</p>
            <Link href="/analyze" style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', borderRadius: '10px', padding: '10px 28px', fontWeight: 700, textDecoration: 'none', display: 'inline-block' }}>
              تحليل سيرتي الذاتية
            </Link>
          </div>
        ) : (
          <>
            {/* CV chip */}
            <div style={{ background: '#0A1628', border: '1px solid #1A3060', borderRadius: '12px', padding: '1rem 1.25rem', marginBottom: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: '#8A9AB8', fontSize: '0.85rem', marginLeft: 'auto' }}>📊 نقاطك: <strong style={{ color: '#C9A84C' }}>{cvScore}/100</strong></span>
              <span style={{ color: '#8A9AB8', fontSize: '0.85rem' }}>🎯 مجالك: <strong style={{ color: '#E8EAF0' }}>{detectedRole}</strong></span>
              {keySkills.slice(0, 4).map(s => (
                <span key={s} style={{ background: '#1A3060', color: '#8A9AB8', borderRadius: '999px', fontSize: '0.75rem', padding: '2px 10px' }}>{s}</span>
              ))}
            </div>

            {/* Country selector */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {COUNTRIES.map(c => (
                <button key={c.code} onClick={() => setCountry(c.code)}
                  style={{ background: country === c.code ? '#1A3060' : 'transparent', color: country === c.code ? '#C9A84C' : '#4A5A78', border: `1px solid ${country === c.code ? '#2A4080' : '#1A3060'}`, borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', cursor: 'pointer', fontWeight: country === c.code ? 700 : 400 }}>
                  {c.label}
                </button>
              ))}
            </div>

            <button onClick={search} disabled={loading}
              style={{ background: 'linear-gradient(135deg, #C9A84C, #A07830)', color: '#fff', border: 'none', borderRadius: '12px', padding: '12px 0', fontWeight: 800, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, width: '100%', marginBottom: '1.5rem', fontFamily: 'sans-serif' }}>
              {loading ? '⏳ جاري البحث والتقييم...' : '🔍 ابحث عن وظائف وجهّز للتقديم'}
            </button>

            {error && (
              <div style={{ background: '#ff444422', border: '1px solid #ff444444', borderRadius: '10px', padding: '1rem', color: '#ff8888', marginBottom: '1rem', fontSize: '0.88rem' }}>{error}</div>
            )}

            {searched && jobs.length === 0 && !error && (
              <div style={{ textAlign: 'center', color: '#4A5A78', padding: '2rem' }}>
                <p style={{ fontSize: '2rem' }}>🔍</p>
                <p>لم نجد وظائف في هذا البلد حالياً. جرّب دولة أخرى.</p>
              </div>
            )}

            {jobs.length > 0 && (
              <>
                <p style={{ color: '#4A5A78', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
                  {jobs.length} وظيفة — اضغط <strong style={{ color: '#C9A84C' }}>🤖 تقديم ذكي</strong> لتوليد حزمة تقديم كاملة بالذكاء الاصطناعي
                </p>
                {jobs.map(job => <JobCard key={job.id} job={job} onSmartApply={setApplyJob} />)}
              </>
            )}
          </>
        )}
      </div>

      {applyJob && <SmartApplyModal job={applyJob} onClose={() => setApplyJob(null)} />}
    </div>
  )
}
