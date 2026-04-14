'use client'

import { useEffect, useState } from 'react'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

interface Props {
  refreshTrigger: number
}

type HistoryItem = Pick<CvAnalysisRow, 'id' | 'filename' | 'score' | 'created_at'>

export default function AnalysisHistory({ refreshTrigger }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/cv/analyses')
      .then((res) => res.json())
      .then((data: HistoryItem[]) => {
        setItems(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [refreshTrigger])

  if (loading) {
    return (
      <p style={{ color: '#8A9AB8', textAlign: 'center', padding: '1rem' }}>
        جاري التحميل...
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
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 1rem',
            background: 'rgba(10,22,40,0.6)',
            border: '1px solid rgba(201,168,76,0.15)',
            borderRadius: '10px',
            direction: 'rtl',
          }}
        >
          <span style={{ color: '#E8EAF0', fontSize: '0.9rem' }}>{item.filename}</span>
          <span style={{ color: '#C9A84C', fontWeight: 700, fontSize: '0.9rem' }}>
            {item.score}/100
          </span>
        </div>
      ))}
    </div>
  )
}
