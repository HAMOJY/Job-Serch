/**
 * @jest-environment node
 */
import { POST } from '@/app/api/waitlist/route'
import { NextRequest } from 'next/server'

const mockInsert = jest.fn()
const mockInngestSend = jest.fn()

jest.mock('@/lib/supabase', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      insert: jest.fn(),
    })),
  },
}))

jest.mock('@/lib/inngest', () => ({
  inngest: { send: jest.fn() },
}))

import { supabaseAdmin } from '@/lib/supabase'
import { inngest } from '@/lib/inngest'

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/waitlist', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const valid = {
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+966501234567',
  role: 'job_seeker',
}

describe('POST /api/waitlist', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(supabaseAdmin.from as jest.Mock).mockReturnValue({ insert: mockInsert })
    mockInsert.mockResolvedValue({ error: null })
    ;(inngest.send as jest.Mock).mockImplementation(mockInngestSend)
    mockInngestSend.mockResolvedValue({})
  })

  it('returns 200 for valid data', async () => {
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
  })

  it('calls insert with correct data', async () => {
    await POST(makeRequest(valid))
    expect(mockInsert).toHaveBeenCalledWith({
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      role: 'job_seeker',
    })
  })

  it('sends Inngest event after successful insert', async () => {
    await POST(makeRequest(valid))
    expect(mockInngestSend).toHaveBeenCalledWith({
      name: 'waitlist/user.registered',
      data: { name: 'أحمد محمد', email: 'ahmed@example.com', role: 'job_seeker' },
    })
  })

  it('returns 400 for invalid email', async () => {
    const res = await POST(makeRequest({ ...valid, email: 'bad' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for empty name', async () => {
    const res = await POST(makeRequest({ ...valid, name: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 409 for duplicate email', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } })
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(409)
    const json = await res.json()
    expect(json.error).toBe('هذا البريد الإلكتروني مسجل مسبقاً')
  })

  it('returns 500 for other DB errors', async () => {
    mockInsert.mockResolvedValue({ error: { code: '500', message: 'db error' } })
    const res = await POST(makeRequest(valid))
    expect(res.status).toBe(500)
  })

  it('does not call Inngest if insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { code: '23505', message: 'duplicate' } })
    await POST(makeRequest(valid))
    expect(mockInngestSend).not.toHaveBeenCalled()
  })
})
