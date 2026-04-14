'use client'

import { useState } from 'react'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

const CATEGORY_LABELS: Record<string, string> = {
  technical_skills: 'المهارات التقنية',
  work_experience: 'الخبرة المهنية',
  education: 'التعليم والشهادات',
  clarity: 'وضوح وتنظيم الـ CV',
  language_quality: 'جودة اللغة والكتابة',
  ats_compatibility: 'توافق مع أنظمة ATS',
}

const CATEGORY_ORDER = ['technical_skills', 'work_experience', 'education', 'clarity', 'language_quality', 'ats_compatibility']

function scoreColor(score: number): string {
  if (score >= 80) return '#00D4FF'
  if (score >= 60) return '#C9A84C'
  return '#FF6B6B'
}

function scoreLabel(score: number): string {
  if (score >= 85) return 'ممتاز'
  if (score >= 70) return 'جيد جداً'
  if (score >= 55) return 'جيد'
  if (score >= 40) return 'يحتاج تحسين'
  return 'ضعيف'
}

function CircularScore({ score }: { score: number }) {
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = scoreColor(score)

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px', flexShrink: 0 }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease', filter: `drop-shadow(0 0 8px ${color}66)` }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '2.2rem', fontWeight: 900, color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '0.65rem', color: '#8A9AB8', marginTop: '0.1rem' }}>/ 100</div>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color, marginTop: '0.2rem' }}>{scoreLabel(score)}</div>
      </div>
    </div>
  )
}

type Tab = 'overview' | 'details' | 'tips'

interface Props {
  analysis: CvAnalysisRow
}

export default function AnalysisResult({ analysis }: Props) {
  const { score, categories, recommendations, filename, created_at } = analysis
  const strengths = analysis.strengths
  const detected_role = analysis.detected_role
  const key_skills = analysis.key_skills
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '0.5rem 1rem',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    fontFamily: "'Cairo', sans-serif",
    background: tab === t ? 'rgba(201,168,76,0.15)' : 'transparent',
    color: tab === t ? '#C9A84C' : '#8A9AB8',
    transition: 'all 0.2s',
  })

  return (
    <div style={{ background: 'rgba(10,22,40,0.9)', border: '1px solid rgba(201,168,76,0.25)', borderRadius: '20px', padding: '1.75rem', direction: 'rtl' }}>

      {/* Header row */}
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <CircularScore score={score} />
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ color: '#8A9AB8', fontSize: '0.75rem', marginBottom: '0.35rem' }}>🧠 تقرير تحليل AI</div>
          <div style={{ color: '#E8EAF0', fontWeight: 700, fontSize: '1rem', marginBottom: '0.2rem' }}>{filename}</div>
          <div style={{ color: '#4A5A78', fontSize: '0.75rem', marginBottom: '0.75rem' }}>
            {new Date(created_at).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {detected_role && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '20px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#00D4FF', marginBottom: '0.75rem' }}>
              💼 {detected_role}
            </div>
          )}

          {key_skills && key_skills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {key_skills.slice(0, 6).map((skill, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '0.2rem 0.55rem', fontSize: '0.72rem', color: '#C8CADB' }}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={handleShare}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0.5rem 0.875rem', color: copied ? '#00D4FF' : '#8A9AB8', fontSize: '0.8rem', cursor: 'pointer', fontFamily: "'Cairo', sans-serif", whiteSpace: 'nowrap' }}
        >
          {copied ? '✅ تم النسخ' : '🔗 مشاركة'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.25rem' }}>
        <button style={tabStyle('overview')} onClick={() => setTab('overview')}>نظرة عامة</button>
        <button style={tabStyle('details')} onClick={() => setTab('details')}>التفاصيل</button>
        <button style={tabStyle('tips')} onClick={() => setTab('tips')}>التوصيات</button>
      </div>

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div>
          {strengths && strengths.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#00D4FF', marginBottom: '0.6rem', fontWeight: 700 }}>✅ نقاط القوة</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: '0.85rem', color: '#C8CADB', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)', borderRadius: '8px', padding: '0.5rem 0.75rem' }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div style={{ fontSize: '0.8rem', color: '#C9A84C', marginBottom: '0.6rem', fontWeight: 700 }}>📊 ملخص التقييم</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
            {CATEGORY_ORDER.slice(0, 4).map(key => {
              const val = (categories as Record<string, number>)[key] ?? 70
              return (
                <div key={key} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.75rem', color: '#8A9AB8', marginBottom: '0.3rem' }}>{CATEGORY_LABELS[key]}</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 900, color: scoreColor(val) }}>
                    {val}<span style={{ fontSize: '0.7rem', color: '#4A5A78' }}>%</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '0.4rem' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: scoreColor(val), borderRadius: '2px', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tab: Details */}
      {tab === 'details' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {CATEGORY_ORDER.map(key => {
            const val = (categories as Record<string, number>)[key] ?? 70
            return (
              <div key={key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.875rem' }}>
                  <span style={{ color: '#E8EAF0' }}>{CATEGORY_LABELS[key]}</span>
                  <span style={{ color: scoreColor(val), fontWeight: 700 }}>{val}%</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${val}%`, background: `linear-gradient(90deg, ${scoreColor(val)}, ${scoreColor(val)}88)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab: Tips */}
      {tab === 'tips' && (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {recommendations.map((rec, i) => (
            <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.1)', borderRadius: '10px', padding: '0.75rem' }}>
              <span style={{ color: '#C9A84C', fontWeight: 900, fontSize: '0.85rem', flexShrink: 0 }}>{i + 1}</span>
              <span style={{ fontSize: '0.875rem', color: '#C8CADB', lineHeight: 1.5 }}>{rec}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Job search CTA */}
      {detected_role && (
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a
            href={`https://www.bayt.com/ar/jobs/?q=${encodeURIComponent(detected_role)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, minWidth: '140px', display: 'block', background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: '10px', padding: '0.65rem', textAlign: 'center', textDecoration: 'none', color: '#00D4FF', fontSize: '0.8rem', fontWeight: 600 }}
          >
            🔍 ابحث عن {detected_role} في Bayt
          </a>
          <a
            href={`https://wuzzuf.net/search/jobs/?q=${encodeURIComponent(detected_role)}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, minWidth: '140px', display: 'block', background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: '10px', padding: '0.65rem', textAlign: 'center', textDecoration: 'none', color: '#C9A84C', fontSize: '0.8rem', fontWeight: 600 }}
          >
            🔍 ابحث في Wuzzuf
          </a>
        </div>
      )}
    </div>
  )
}
