/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

// Mock @/lib/supabase-server directly so middleware can be imported cleanly
jest.mock('@/lib/supabase-server', () => ({
  createMiddlewareSupabaseClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  })),
}))

// Import middleware after mocks are set up
import { middleware } from '@/middleware'

// Helper to build a mock NextRequest
function makeRequest(path: string) {
  return new NextRequest(`http://localhost${path}`)
}

describe('middleware route protection', () => {
  it('redirects unauthenticated user from /analyze to /auth/login', async () => {
    const req = makeRequest('/analyze')
    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/auth/login')
  })

  it('allows unauthenticated user to access /auth/login', async () => {
    const req = makeRequest('/auth/login')
    const res = await middleware(req)
    // not a redirect
    expect(res.status).not.toBe(307)
  })
})
