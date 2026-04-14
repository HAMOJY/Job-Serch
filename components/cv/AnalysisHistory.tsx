'use client'

import { useEffect, useState } from 'react'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'
import AnalysisResult from '@/components/cv/AnalysisResult'

interface Props {
  refreshTrigger: number
}

type HistoryItem = Pick<
  CvAnalysisRow,
  'id' | 'filename' | 'score' | 'categories' | 'recommendations' | 'status' | 'created_at'
>

export default function AnalysisHistory({ refreshTrigger }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setFetchError(false)
    fetch('/api/cv/analyses')
      .then((res) => {
        if (!res.ok) throw new Error('fetch failed')
        return res.json()
      })
      .then((data: HistoryItem[]) => {
        setItems(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        setFetchError(true)
        setLoading(false)
      })
  }, [refreshTrigger])

  if (loading) {
    return (
      <p style={{ color: '#8A9AB8', textAlign: 'center', padding: '1rem' }}>
        جاري التحميل...
      </p>
    )
  }

  if (fetchError) {
    return (
      <p style={{ color: '#FF6B6B', textAlign: 'center', padding: '1rem' }}>
        تعذّر تحميل السجل، حاول تحديث الصفحة
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <p style={{ color: '#8A9AB8', textAlign: 'center', padding: '1rem' }}>
        لا يوجد تحليل سابق
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {items.map((item) => {
        const isExpanded = expandedId === item.id
        return (
          <div key={item.id}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : item.id)}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                background: 'rgba(10,22,40,0.6)',
                border: '1px solid rgba(201,168,76,0.15)',
                borderRadius: isExpanded ? '10px 10px 0 0' : '10px',
                direction: 'rtl',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'right',
              }}
            >
              <span style={{ color: '#E8EAF0', fontSize: '0.9rem' }}>{item.filename}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.9rem' }}>
                  {item.score}/100
                </span>
                <span style={{ color: '#8A9AB8', fontSize: '0.75rem' }}>
                  {isExpanded ? '▲' : '▼'}
                </span>
              </div>
            </button>

            {isExpanded && (
              <div
                style={{
                  border: '1px solid rgba(201,168,76,0.15)',
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  overflow: 'hidden',
                }}
              >
                <AnalysisResult
                  analysis={{
                    ...item,
                    user_id: '',
                    file_path: '',
                    error_msg: null,
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
