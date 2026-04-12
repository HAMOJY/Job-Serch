import { z } from 'zod'

export const waitlistSchema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حرفان على الأقل)'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(8, 'رقم الهاتف غير صحيح'),
  role: z.enum(['job_seeker', 'recruiter'], {
    error: 'يرجى اختيار نوع الحساب',
  }),
})

export type WaitlistInput = z.infer<typeof waitlistSchema>
