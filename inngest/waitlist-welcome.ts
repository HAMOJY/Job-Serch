import { inngest } from '@/lib/inngest'

export const waitlistWelcome = inngest.createFunction(
  { id: 'waitlist-welcome', triggers: [{ event: 'waitlist/user.registered' }] },
  async ({ event, step }) => {
    const { name, email, role } = event.data as {
      name: string
      email: string
      role: 'job_seeker' | 'recruiter'
    }

    await step.run('log-registration', async () => {
      console.log(`[Waitlist] New signup: ${name} <${email}> — ${role}`)
      // TODO: أضف هنا إرسال confirmation email في مرحلة لاحقة (Resend/SendGrid)
    })

    return { processed: true, email }
  }
)
