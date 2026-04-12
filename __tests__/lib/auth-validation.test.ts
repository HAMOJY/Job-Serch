// @jest-environment node
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '@/lib/auth-validation'

describe('registerSchema', () => {
  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse({
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      password: 'securePass123',
      role: 'job_seeker',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional phone', () => {
    const result = registerSchema.safeParse({
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      password: 'securePass123',
      role: 'recruiter',
      phone: '+966501234567',
    })
    expect(result.success).toBe(true)
  })

  it('rejects password shorter than 8 chars', () => {
    const result = registerSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      password: 'short',
      role: 'job_seeker',
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0].message).toBe(
      'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    )
  })

  it('rejects invalid role', () => {
    const result = registerSchema.safeParse({
      name: 'Ahmed',
      email: 'a@b.com',
      password: 'validpass',
      role: 'admin',
    })
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('accepts valid login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'not-email', password: 'pass' })
    expect(result.success).toBe(false)
  })
})

describe('forgotPasswordSchema', () => {
  it('accepts valid email', () => {
    const result = forgotPasswordSchema.safeParse({ email: 'user@example.com' })
    expect(result.success).toBe(true)
  })
})

describe('resetPasswordSchema', () => {
  it('rejects passwords that do not match', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpass123',
      confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    expect(result.error!.issues[0].message).toBe('كلمات المرور غير متطابقة')
  })

  it('accepts matching passwords', () => {
    const result = resetPasswordSchema.safeParse({
      password: 'newpass123',
      confirmPassword: 'newpass123',
    })
    expect(result.success).toBe(true)
  })
})

describe('updateProfileSchema', () => {
  it('accepts partial profile update', () => {
    const result = updateProfileSchema.safeParse({ bio: 'Developer' })
    expect(result.success).toBe(true)
  })

  it('accepts full profile update', () => {
    const result = updateProfileSchema.safeParse({
      name: 'Ahmed',
      job_title: 'Frontend Developer',
      location: 'Riyadh',
      bio: 'Loves React',
      linkedin_url: 'https://linkedin.com/in/ahmed',
      github_url: 'https://github.com/ahmed',
    })
    expect(result.success).toBe(true)
  })
})
