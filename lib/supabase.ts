import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// للمتصفح — صلاحيات محدودة (insert فقط بسبب RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// للـ server فقط — لا تستخدمه في client components أبداً
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
