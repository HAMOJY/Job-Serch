// @jest-environment node
import { createBrowserSupabaseClient } from '@/lib/supabase-browser'

describe('supabase-browser', () => {
  it('createBrowserSupabaseClient returns a client with auth property', () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
    const client = createBrowserSupabaseClient()
    expect(client.auth).toBeDefined()
  })
})
