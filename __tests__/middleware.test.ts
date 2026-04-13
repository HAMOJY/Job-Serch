/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock @/lib/supabase-server — needed because lib/supabase-server.ts has
// `import 'server-only'` which throws in Jest. We mock the whole module.
const mockGetUser = jest.fn()

jest.mock('@/lib/supabase-server', () => ({
  createMiddlewareSupabaseClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
  })),
}))

function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`)
}

describe('middleware route protection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Default: unauthenticated
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('redirects unauthenticated user from /analyze to /auth/login with ?next param', async () => {
    const { middleware } = await import('@/middleware')
    const req = makeRequest('/analyze')
    const res = await middleware(req)
    expect(res.status).toBe(307)
    const location = res.headers.get('location') ?? ''
    expect(location).toContain('/auth/login')
    expect(location).toContain('next=%2Fanalyze')
  })

  it('allows unauthenticated user to access /auth/login without redirect', async () => {
    const { middleware } = await import('@/middleware')
    const req = makeRequest('/auth/login')
    const res = await middleware(req)
    expect(res.status).not.toBe(307)
  })

  it('redirects authenticated user from /auth/login to /analyze', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null })
    const { middleware } = await import('@/middleware')
    const req = makeRequest('/auth/login')
    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/analyze')
  })
})
