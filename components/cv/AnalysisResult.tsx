'use client'

import type { CvAnalysisRow } from '@/lib/cv-analyzer'

const CATEGORY_LABELS: Record<string, string> = {
  technical_skills: 'المهارات التقنية',
  work_experience: 'الخبرة المهنية',
  education: 'التعليم والشهادات',
  clarity: 'وضوح وتنظيم الـ CV',
}

const CATEGORY_ORDER = ['technical_skills', 'work_experience', 'education', 'clarity']

function scoreColor(score: number): string {
  if (score >= 80) return '#00D4FF'
  if (score >= 60) return '#C9A84C'
  return '#FF6B6B'
}

interface Props {
  analysis: CvAnalysisRow
}

export default function AnalysisResult({ analysis }: Props) {
  const { score, categories, recommendations, filename, created_at } = analysis

  return (
    <div
      style={{
        background: 'rgba(10,22,40,0.8)',
        border: '1px solid rgba(201,168,76,0.2)',
        borderRadius: '20px',
        padding: '2rem',
        direction: 'rtl',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ color: '#8A9AB8', fontSize: '0.8rem' }}>🧠 تقرير تحليل AI</div>
          <div style={{ color: '#8A9AB8', fontSize: '0.75rem', marginTop: '0.2rem' }}>
            <span>{filename}</span>
            <span> — {new Date(created_at).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: scoreColor(score), lineHeight: 1 }}>
            {score}
          </div>
          <div style={{ color: '#8A9AB8', fontSize: '0.75rem' }}>/ 100</div>
        </div>
      </div>

      {/* Category bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {CATEGORY_ORDER.map((key) => {
          const value = categories[key as keyof typeof categories]
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.85rem' }}>
                <span style={{ color: '#E8EAF0' }}>{CATEGORY_LABELS[key]}</span>
                <span style={{ color: scoreColor(value), fontWeight: 700 }}>{value}%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${value}%`,
                    background: `linear-gradient(90deg, ${scoreColor(value)}, ${scoreColor(value)}88)`,
                    borderRadius: '3px',
                    transition: 'width 0.6s ease',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Recommendations */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
        <div style={{ fontSize: '0.8rem', color: '#8A9AB8', marginBottom: '0.6rem' }}>
          💡 توصيات التحسين:
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {recommendations.map((rec, i) => (
            <li
              key={i}
              style={{
                fontSize: '0.85rem',
                color: '#C8CADB',
                padding: '0.3rem 0',
                borderBottom: i < recommendations.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}
            >
              • {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
