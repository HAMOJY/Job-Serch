/**
 * @jest-environment node
 */
const mockGetUser = jest.fn()
const mockSelect = jest.fn()

jest.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => mockSelect(),
        }),
      }),
    }),
  })),
}))
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({ getAll: jest.fn(() => []), set: jest.fn() })),
}))

describe('GET /api/cv/analyses', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when unauthenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const { GET } = await import('@/app/api/cv/analyses/route')
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns list of analyses for authenticated user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    const analyses = [
      { id: 'a1', score: 87, filename: 'cv.pdf', created_at: '2025-01-01' },
      { id: 'a2', score: 72, filename: 'resume.docx', created_at: '2024-12-01' },
    ]
    mockSelect.mockResolvedValue({ data: analyses, error: null })
    const { GET } = await import('@/app/api/cv/analyses/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(2)
    expect(body[0].score).toBe(87)
  })

  it('returns empty array when user has no analyses', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
    mockSelect.mockResolvedValue({ data: [], error: null })
    const { GET } = await import('@/app/api/cv/analyses/route')
    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual([])
  })
})
