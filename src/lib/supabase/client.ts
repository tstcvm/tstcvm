import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    // fallback ไว้ให้ build ผ่านตอนยังไม่ได้ตั้ง env
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder'
  )
}
