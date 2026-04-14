'use client'

import { useState, useRef } from 'react'

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]
const MAX_SIZE = 10 * 1024 * 1024

interface Props {
  onFile: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFile, disabled = false }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type) && !file.name.toLowerCase().endsWith('.docx')) {
      return 'الملف يجب أن يكون PDF أو Word فقط'
    }
    if (file.size > MAX_SIZE) {
      return 'الملف يجب أن يكون أقل من 10 ميغابايت'
    }
    return null
  }

  function handleFileChange(file: File) {
    const err = validate(file)
    if (err) {
      setError(err)
      setSelectedFile(null)
    } else {
      setError(null)
      setSelectedFile(file)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileChange(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileChange(file)
  }

  function handleSubmit() {
    if (selectedFile) onFile(selectedFile)
  }

  return (
    <div style={{ position: 'relative' }}>
      {disabled && (
        <div
          data-testid="upload-disabled-overlay"
          style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'rgba(5,11,26,0.7)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <p style={{ color: '#F0D080', fontWeight: 600, textAlign: 'center' }}>
            يرجى تفعيل بريدك الإلكتروني أولاً
          </p>
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? '#C9A84C' : 'rgba(201,168,76,0.3)'}`,
          borderRadius: '16px',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: dragOver ? 'rgba(201,168,76,0.05)' : 'rgba(10,22,40,0.6)',
          transition: 'all 0.2s',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <p style={{ color: '#E8EAF0', marginBottom: '0.5rem', fontWeight: 600 }}>
          {selectedFile ? selectedFile.name : 'اسحب وأفلت ملف CV هنا'}
        </p>
        <p style={{ color: '#8A9AB8', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
          PDF أو Word — حتى 10 MB
        </p>

        {error && (
          <p style={{ color: '#FF6B6B', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {error}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleInputChange}
          style={{ display: 'none' }}
          disabled={disabled}
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || disabled}
        style={{
          marginTop: '1rem',
          width: '100%',
          padding: '0.9rem',
          borderRadius: '50px',
          border: 'none',
          background: selectedFile && !disabled
            ? 'linear-gradient(135deg,#C9A84C,#8A6A20)'
            : 'rgba(201,168,76,0.2)',
          color: selectedFile && !disabled ? '#fff' : '#8A9AB8',
          fontSize: '1rem',
          fontWeight: 700,
          cursor: selectedFile && !disabled ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'all 0.2s',
        }}
      >
        تحليل بالذكاء الاصطناعي ⚡
      </button>
    </div>
  )
}
