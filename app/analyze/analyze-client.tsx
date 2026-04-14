'use client'

import { useState } from 'react'
import RoleModal from '@/components/auth/RoleModal'
import UploadZone from '@/components/cv/UploadZone'
import AnalysisResult from '@/components/cv/AnalysisResult'
import AnalysisHistory from '@/components/cv/AnalysisHistory'
import type { CvAnalysisRow } from '@/lib/cv-analyzer'

interface Profile {
  id: string
  name: string
  role: string
}

interface Props {
  profile: Profile | null
  userId: string
  showRoleModal: boolean
  emailVerified: boolean
  initialAnalysis: CvAnalysisRow | null
}

type State = 'idle' | 'analyzing' | 'done' | 'error'

export default function AnalyzeClient({
  profile,
  userId,
  showRoleModal,
  emailVerified,
  initialAnalysis,
}: Props) {
  const [modalOpen, setModalOpen] = useState(showRoleModal)
  const [state, setState] = useState<State>(initialAnalysis ? 'done' : 'idle')
  const [analysis, setAnalysis] = useState<CvAnalysisRow | null>(initialAnalysis)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  async function handleFile(file: File) {
    setState('analyzing')
    setErrorMsg(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/cv/analyze', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'حدث خطأ، حاول مجدداً')
        setState('error')
        return
      }

      setAnalysis(data as CvAnalysisRow)
      setState('done')
      setRefreshTrigger((n) => n + 1)
    } catch {
      setErrorMsg('حدث خطأ في الاتصال، تحقق من اتصالك بالإنترنت')
      setState('error')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#060D1A',
        direction: 'rtl',
        fontFamily: "'Cairo', sans-serif",
        padding: '2rem',
        paddingTop: '5rem',
      }}
    >
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        {/* Page header */}
        <h1 style={{ color: '#E8EAF0', fontSize: '1.6rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          مرحباً، {profile?.name ?? 'مستخدم'} 👋
        </h1>
        <p style={{ color: '#8A9AB8', marginBottom: '2rem' }}>
          ارفع سيرتك الذاتية للحصول على تقييم فوري بالذكاء الاصطناعي
        </p>

        {/* Email verification banner */}
        {!emailVerified && (
          <div
            style={{
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <div>
              <p style={{ color: '#F0D080', fontWeight: 600, margin: 0 }}>
                يرجى تفعيل بريدك الإلكتروني أولاً لتحليل سيرتك الذاتية
              </p>
              <p style={{ color: '#8A9AB8', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                تحقق من صندوق الوارد أو مجلد الـ Spam
              </p>
            </div>
          </div>
        )}

        {/* Upload zone */}
        {state !== 'done' && (
          <div style={{ marginBottom: '2rem' }}>
            <UploadZone onFile={handleFile} disabled={!emailVerified} />
          </div>
        )}

        {/* Analyzing spinner */}
        {state === 'analyzing' && (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#8A9AB8' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            <p>جاري تحليل سيرتك الذاتية... قد يستغرق حتى 15 ثانية</p>
          </div>
        )}

        {/* Error message */}
        {state === 'error' && errorMsg && (
          <div
            style={{
              background: 'rgba(255,107,107,0.1)',
              border: '1px solid rgba(255,107,107,0.3)',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#FF6B6B',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Analysis result */}
        {state === 'done' && analysis && (
          <div style={{ marginBottom: '2rem' }}>
            <AnalysisResult analysis={analysis} />
            <button
              onClick={() => { setState('idle'); setAnalysis(null) }}
              style={{
                marginTop: '1rem',
                width: '100%',
                padding: '0.75rem',
                borderRadius: '50px',
                border: '1px solid rgba(201,168,76,0.3)',
                background: 'transparent',
                color: '#C9A84C',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              تحليل CV جديد
            </button>
          </div>
        )}

        {/* History */}
        <AnalysisHistory refreshTrigger={refreshTrigger} />
      </div>

      {modalOpen && (
        <RoleModal userId={userId} onClose={() => setModalOpen(false)} />
      )}
    </div>
  )
}
