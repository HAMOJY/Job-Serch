import { serve } from 'inngest/next'
import { inngest } from '@/lib/inngest'
import { waitlistWelcome } from '@/inngest/waitlist-welcome'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [waitlistWelcome],
})
