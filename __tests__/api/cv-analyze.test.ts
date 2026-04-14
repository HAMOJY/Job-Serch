/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()
const mockStorageUpload = jest.fn()
const mockStorageRemove = jest.fn()
const mockDbInsert = jest.fn()
const mockExtractText = jest.fn()
const mockAnalyzeCV = jest.fn()

jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    storage: { from: () => ({ upload: mockStorageUpload, remove: mockStorageRemove }) },
    from: () => ({
      insert: () => ({ select: () => ({ single: mockDbInsert }) }),
    }),
  })),
}))
jest.mock('@/lib/cv-extractor', () => ({ extractTextFromBuffer: mockExtractText }))
jest.mock('@/lib/cv-analyzer', () => ({ analyzeCV: mockAnalyzeCV }))
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ getAll: jest.fn(() => []), set: jest.fn() })),
}))

function makeRequest(file?: File): NextRequest {
  const formData = new FormData()
  if (file) formData.append('file', file)
  return new NextRequest('http://localhost/api/cv/analyze', {
    method: 'POST',
    body: formData,
  })
}

const VERIFIED_USER = { id: 'user-1', email_confirmed_at: '2025-01-01T00:00:00Z' }
const UNVERIFIED_USER = { id: 'user-1', email_confirmed_at: null }

describe('POST /api/cv/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockStorageRemove.mockResolvedValue({ error: null })
  })

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(401)
  })

  it('returns 403 when email not verified', async () => {
    mockGetUser.mockResolvedValue({ data: { user: UNVERIFIED_USER } })
    const file = new File(['content'], 'cv.pdf', { type: 'application/pdf' })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest(file))
    expect(res.status).toBe(403)
    const body = await res.json()
    expect(body.error).toMatch(/تفعيل/)
  })

  it('returns 400 when no file attached', async () => {
    mockGetUser.mockResolvedValue({ data: { user: VERIFIED_USER } })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest())
    expect(res.status).toBe(400)
  })

  it('returns 415 for unsupported file type', async () => {
    mockGetUser.mockResolvedValue({ data: { user: VERIFIED_USER } })
    const file = new File(['content'], 'cv.txt', { type: 'text/plain' })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest(file))
    expect(res.status).toBe(415)
    const body = await res.json()
    expect(body.error).toMatch(/PDF/)
  })

  it('returns 413 when file exceeds 10 MB', async () => {
    mockGetUser.mockResolvedValue({ data: { user: VERIFIED_USER } })
    const bigContent = 'x'.repeat(11 * 1024 * 1024)
    const file = new File([bigContent], 'big.pdf', { type: 'application/pdf' })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest(file))
    expect(res.status).toBe(413)
  })

  it('returns 422 when text extraction fails', async () => {
    mockGetUser.mockResolvedValue({ data: { user: VERIFIED_USER } })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockExtractText.mockRejectedValue(new Error('password protected'))
    const file = new File(['content'], 'cv.pdf', { type: 'application/pdf' })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest(file))
    expect(res.status).toBe(422)
  })

  it('returns 200 with analysis on full success', async () => {
    mockGetUser.mockResolvedValue({ data: { user: VERIFIED_USER } })
    mockStorageUpload.mockResolvedValue({ error: null })
    mockExtractText.mockResolvedValue('Ahmed Ali\nSoftware Engineer')
    mockAnalyzeCV.mockResolvedValue({
      score: 87,
      categories: { technical_skills: 91, work_experience: 85, education: 78, clarity: 94 },
      recommendations: ['أضف مشاريع GitHub'],
    })
    mockDbInsert.mockResolvedValue({
      data: { id: 'analysis-1', score: 87, filename: 'cv.pdf' },
      error: null,
    })

    const file = new File(['pdf content'], 'cv.pdf', { type: 'application/pdf' })
    const { POST } = await import('@/app/api/cv/analyze/route')
    const res = await POST(makeRequest(file))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.score).toBe(87)
  })
})
