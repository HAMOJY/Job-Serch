import { NextRequest, NextResponse } from 'next/server'
import { inngest } from '@/lib/inngest'

export async function POST(req: NextRequest) {
  try {
    const { name, email, role } = await req.json()
    if (!name || !email || !role) {
      return NextResponse.json({ error: 'missing fields' }, { status: 400 })
    }
    await inngest.send({
      name: 'auth/user.registered',
      data: { name, email, role },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
