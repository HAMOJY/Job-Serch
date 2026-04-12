import { waitlistSchema } from '@/lib/validation'

const valid = {
  name: 'أحمد محمد',
  email: 'ahmed@example.com',
  phone: '+966501234567',
  role: 'job_seeker' as const,
}

describe('waitlistSchema', () => {
  it('accepts valid data', () => {
    expect(waitlistSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty name', () => {
    expect(waitlistSchema.safeParse({ ...valid, name: '' }).success).toBe(false)
  })

  it('rejects name shorter than 2 chars', () => {
    expect(waitlistSchema.safeParse({ ...valid, name: 'أ' }).success).toBe(false)
  })

  it('rejects invalid email', () => {
    expect(waitlistSchema.safeParse({ ...valid, email: 'not-email' }).success).toBe(false)
  })

  it('rejects empty phone', () => {
    expect(waitlistSchema.safeParse({ ...valid, phone: '' }).success).toBe(false)
  })

  it('rejects phone shorter than 8 chars', () => {
    expect(waitlistSchema.safeParse({ ...valid, phone: '123' }).success).toBe(false)
  })

  it('rejects invalid role', () => {
    expect(waitlistSchema.safeParse({ ...valid, role: 'admin' as any }).success).toBe(false)
  })

  it('accepts recruiter role', () => {
    expect(waitlistSchema.safeParse({ ...valid, role: 'recruiter' }).success).toBe(true)
  })
})
