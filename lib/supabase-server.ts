import { createServerClient, createBrowserClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// Read env at call-time so tests can set process.env before calling
function getEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  }
}

// For Client Components
export function createBrowserSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnv()
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// For Server Components and Route Handlers
export async function createServerSupabaseClient() {
  const { supabaseUrl, supabaseAnonKey } = getEnv()
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

// For Middleware — takes request + response, returns updated response
export function createMiddlewareSupabaseClient(
  request: NextRequest,
  response: NextResponse
) {
  const { supabaseUrl, supabaseAnonKey } = getEnv()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        )
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })
}
