import { inngest } from '@/lib/inngest'

export const authWelcome = inngest.createFunction(
  {
    id: 'auth-welcome',
    name: 'Send Welcome Email on Auth Registration',
    triggers: [{ event: 'auth/user.registered' }],
  },
  async ({ event }) => {
    const { name, email } = event.data as { name: string; email: string; role: string }

    // Email sending is intentionally a console.log stub — same pattern as waitlist-welcome.
    // Wire up Resend/SendGrid here when the email provider task is built.
    console.log(`[auth-welcome] Sending welcome email to ${name} <${email}>`)

    return { sent: true, email }
  }
)
