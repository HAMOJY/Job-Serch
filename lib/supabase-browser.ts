'use client'

import { createBrowserClient } from '@supabase/ssr'

function getEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}

export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
