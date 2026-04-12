// @jest-environment node
import { createBrowserSupabaseClient } from '@/lib/supabase-server'

describe('supabase-server', () => {
  it('createBrowserSupabaseClient returns a client with auth property', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const client = createBrowserSupabaseClient()
    expect(client.auth).toBeDefined()
  })
})
