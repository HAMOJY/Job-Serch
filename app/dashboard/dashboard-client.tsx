'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'
import AnalysisResult from '@/components/cv/AnalysisResult'

interface Profile {
  id: string
  name: string
  role: string
  phone?: string
  bio?: string
  location?: string
  job_title?: string
  created_at: string
}

interface Props {
  profile: Profile | null
  user: { email: string; emailVerified: boolean; createdAt: string }
  analyses: CvAnalysisRow[]
}

const ROLE_LABELS: Record<string, string> = {
  job_seeker: 'باحث عن عمل',
  recruiter: 'مسؤول توظيف',
}

function scoreColor(score: number) {
  if (score >= 80) return '#00D4FF'
  if (score >= 60) return '#C9A84C'
  return '#FF6B6B'
}

export default function DashboardClient({ profile, user, analyses }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const latestAnalysis = analyses[0] ?? null
  const memberSince = new Date(user.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  const card = (children: React.ReactNode, style?: React.CSSProperties) => (
    <div style={{
      background: 'rgba(10,22,40,0.8)',
      border: '1px solid rgba(201,168,76,0.15)',
      borderRadius: '16px',
      padding: '1.5rem',
      ...style,
    }}>
      {children}
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      background: '#060D1A',
      direction: 'rtl',
      fontFamily: "'Cairo', sans-serif",
      padding: '2rem',
      paddingTop: '5rem',
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ color: '#E8EAF0', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
            أهلاً، {profile?.name ?? user.email} 👋
          </h1>
          <p style={{ color: '#8A9AB8', marginTop: '0.3rem', fontSize: '0.9rem' }}>
            {ROLE_LABELS[profile?.role ?? ''] ?? ''} · عضو منذ {memberSince}
          </p>
        </div>

        {/* Email verification warning */}
        {!user.emailVerified && (
          <div style={{
            background: 'rgba(201,168,76,0.08)',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            color: '#F0D080',
            fontSize: '0.9rem',
          }}>
            ⚠️ بريدك الإلكتروني لم يُفعَّل بعد — تحقق من صندوق الوارد لتفعيل الحساب كاملاً
          </div>
        )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {card(
            <>
              <div style={{ color: '#8A9AB8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>تحليلات الـ CV</div>
              <div style={{ color: '#E8EAF0', fontSize: '2rem', fontWeight: 800 }}>{analyses.length}</div>
              <div style={{ color: '#4A5A78', fontSize: '0.75rem' }}>/ 1 مجاني</div>
            </>
          )}
          {card(
            <>
              <div style={{ color: '#8A9AB8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>آخر نتيجة</div>
              <div style={{
                color: latestAnalysis ? scoreColor(latestAnalysis.score) : '#4A5A78',
                fontSize: '2rem', fontWeight: 800,
              }}>
                {latestAnalysis ? latestAnalysis.score : '—'}
              </div>
              <div style={{ color: '#4A5A78', fontSize: '0.75rem' }}>/ 100</div>
            </>
          )}
          {card(
            <>
              <div style={{ color: '#8A9AB8', fontSize: '0.8rem', marginBottom: '0.4rem' }}>حالة الحساب</div>
              <div style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>
                {user.emailVerified ? '✅' : '⏳'}
              </div>
              <div style={{ color: user.emailVerified ? '#00D4FF' : '#C9A84C', fontSize: '0.75rem' }}>
                {user.emailVerified ? 'مفعّل' : 'ينتظر التفعيل'}
              </div>
            </>
          )}
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '1rem', marginBottom: '1.5rem' }}>

          {/* Profile info */}
          {card(
            <>
              <h2 style={{ color: '#C9A84C', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1rem', margin: '0 0 1rem' }}>
                👤 معلوماتي
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {[
                  ['الاسم', profile?.name ?? '—'],
                  ['البريد', user.email],
                  ['الدور', ROLE_LABELS[profile?.role ?? ''] ?? '—'],
                  ['الهاتف', profile?.phone ?? '—'],
                  ['الموقع', profile?.location ?? '—'],
                  ['المسمى الوظيفي', profile?.job_title ?? '—'],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: '#8A9AB8' }}>{label}</span>
                    <span style={{ color: '#E8EAF0', maxWidth: '55%', textAlign: 'left', direction: 'ltr', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/profile/settings" style={{
                display: 'block', marginTop: '1.25rem',
                padding: '0.6rem', textAlign: 'center',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: '8px', color: '#C9A84C',
                fontSize: '0.85rem', textDecoration: 'none',
              }}>
                تعديل الملف الشخصي ←
              </Link>
            </>
          )}

          {/* CV Analysis section */}
          {card(
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ color: '#C9A84C', fontSize: '0.9rem', fontWeight: 600, margin: 0 }}>
                  🧠 تحليل الـ CV
                </h2>
                {analyses.length === 0 && (
                  <Link href="/analyze" style={{
                    background: 'linear-gradient(135deg,#C9A84C,#8A6A20)',
                    color: '#fff', borderRadius: '50px',
                    padding: '0.4rem 1rem', fontSize: '0.8rem',
                    fontWeight: 700, textDecoration: 'none',
                  }}>
                    ابدأ التحليل ⚡
                  </Link>
                )}
              </div>

              {latestAnalysis ? (
                <div>
                  <AnalysisResult analysis={latestAnalysis} />
                  <p style={{ color: '#4A5A78', fontSize: '0.75rem', textAlign: 'center', marginTop: '0.75rem' }}>
                    استخدمت تحليلك المجاني — تواصل معنا للحصول على المزيد
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#8A9AB8' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📄</div>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>لم تقم بتحليل أي CV بعد</p>
                  <Link href="/analyze" style={{
                    background: 'linear-gradient(135deg,#C9A84C,#8A6A20)',
                    color: '#fff', borderRadius: '50px',
                    padding: '0.65rem 1.5rem', fontSize: '0.9rem',
                    fontWeight: 700, textDecoration: 'none',
                  }}>
                    حلّل سيرتك الذاتية مجاناً ⚡
                  </Link>
                </div>
              )}
            </>
          )}
        </div>

        {/* Analysis history */}
        {analyses.length > 1 && card(
          <>
            <h2 style={{ color: '#C9A84C', fontSize: '0.9rem', fontWeight: 600, margin: '0 0 1rem' }}>
              📋 سجل التحليلات
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {analyses.map((a) => {
                const isOpen = expandedId === a.id
                return (
                  <div key={a.id}>
                    <button
                      onClick={() => setExpandedId(isOpen ? null : a.id)}
                      style={{
                        width: '100%', display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: isOpen ? '10px 10px 0 0' : '10px',
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}>
                      <span style={{ color: '#E8EAF0', fontSize: '0.85rem' }}>{a.filename}</span>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ color: scoreColor(a.score), fontWeight: 700, fontSize: '0.85rem' }}>
                          {a.score}/100
                        </span>
                        <span style={{ color: '#4A5A78', fontSize: '0.75rem' }}>
                          {new Date(a.created_at).toLocaleDateString('ar-EG')}
                        </span>
                        <span style={{ color: '#8A9AB8', fontSize: '0.7rem' }}>{isOpen ? '▲' : '▼'}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ border: '1px solid rgba(255,255,255,0.06)', borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                        <AnalysisResult analysis={a} />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem', marginTop: '1rem' }}>
          {[
            { href: '/analyze', label: '🧠 تحليل CV', desc: 'ارفع سيرتك الذاتية' },
            { href: '/jobs', label: '🔍 وظائف مناسبة', desc: 'بحث ذكي بالـ AI' },
            { href: '/profile/settings', label: '⚙️ الإعدادات', desc: 'تعديل ملفك الشخصي' },
            { href: '/', label: '🏠 الرئيسية', desc: 'العودة للموقع' },
          ].map(({ href, label, desc }) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '1rem',
              background: 'rgba(10,22,40,0.6)',
              border: '1px solid rgba(201,168,76,0.1)',
              borderRadius: '12px', textDecoration: 'none',
              textAlign: 'center', transition: 'border-color 0.2s',
            }}>
              <div style={{ color: '#E8EAF0', fontWeight: 600, fontSize: '0.9rem' }}>{label}</div>
              <div style={{ color: '#8A9AB8', fontSize: '0.75rem', marginTop: '0.25rem' }}>{desc}</div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
