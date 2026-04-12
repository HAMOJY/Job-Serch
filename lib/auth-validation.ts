import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  role: z.enum(['job_seeker', 'recruiter'], {
    error: 'يرجى اختيار نوع الحساب',
  }),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
})

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمات المرور غير متطابقة',
    path: ['confirmPassword'],
  })

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').optional(),
  job_title: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  linkedin_url: z.string().url('رابط LinkedIn غير صحيح').optional().or(z.literal('')),
  github_url: z.string().url('رابط GitHub غير صحيح').optional().or(z.literal('')),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
