/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()
const mockExchangeCode = jest.fn()
const mockFrom = jest.fn()

jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: {
      exchangeCodeForSession: mockExchangeCode,
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ getAll: jest.fn(() => []), set: jest.fn() })),
}))

describe('GET /auth/callback', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redirects to /analyze when existing user logs in via OAuth', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } })
    // Profile exists
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: { id: 'user-123' }, error: null }),
        }),
      }),
    })

    const { GET } = await import('@/app/auth/callback/route')
    const req = new NextRequest('http://localhost/auth/callback?code=abc123')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/analyze')
  })

  it('redirects to /analyze?selectRole=1 when new OAuth user has no profile', async () => {
    mockExchangeCode.mockResolvedValue({ error: null })
    mockGetUser.mockResolvedValue({ data: { user: { id: 'new-user' } } })
    // No profile found
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
        }),
      }),
    })

    const { GET } = await import('@/app/auth/callback/route')
    const req = new NextRequest('http://localhost/auth/callback?code=newuser123')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/analyze?selectRole=1')
  })

  it('redirects to /auth/login on code exchange failure', async () => {
    mockExchangeCode.mockResolvedValue({ error: { message: 'invalid code' } })

    const { GET } = await import('@/app/auth/callback/route')
    const req = new NextRequest('http://localhost/auth/callback?code=bad')
    const res = await GET(req)

    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth/login')
  })
})
