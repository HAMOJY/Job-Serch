'use client'

import { useEffect } from 'react'
import WaitlistForm from './WaitlistForm'

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function WaitlistModal({ isOpen, onClose }: Props) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  function handleSuccess() {
    setTimeout(onClose, 3000)
  }

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="إغلاق">✕</button>
        <div className="modal-header">
          <h2>🚀 انضم إلى قائمة الانتظار</h2>
          <p>كن من أوائل المستفيدين من منصة AI Hire Arab</p>
        </div>
        <WaitlistForm onSuccess={handleSuccess} />
      </div>
    </div>
  )
}
