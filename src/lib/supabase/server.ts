import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** client ที่ผูกกับ session ของผู้ใช้ (ใช้ใน server component / server action) */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key-placeholder',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // เรียกจาก server component — proxy.ts จะ refresh session ให้แทน
          }
        },
      },
    }
  )
}
