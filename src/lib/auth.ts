import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { lp, type Locale } from './i18n'
import type { Profile } from './types'

export type Session = { userId: string; email: string | null; profile: Profile | null }

/** ผู้ใช้ปัจจุบัน + โปรไฟล์ (null ถ้ายังไม่ล็อกอิน) */
export async function getSession(): Promise<Session | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return { userId: user.id, email: user.email ?? null, profile: (profile as Profile) ?? null }
}

export function isAdmin(profile: Profile | null | undefined) {
  return profile?.role === 'admin' || profile?.role === 'superadmin'
}

export async function requireSession(locale: Locale, next = '/me'): Promise<Session> {
  const session = await getSession()
  if (!session) redirect(`${lp(locale, '/login')}?next=${encodeURIComponent(lp(locale, next))}`)
  return session
}

export async function requireAdmin(locale: Locale): Promise<Session> {
  const session = await requireSession(locale, '/admin')
  if (!isAdmin(session.profile)) redirect(lp(locale, '/'))
  return session
}

/** สมาชิกที่ยังไม่หมดอายุ */
export async function getActiveMembership(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('end_date', { ascending: false })
    .limit(1)
  const m = data?.[0]
  if (!m) return null
  if (m.end_date && new Date(m.end_date) < new Date(new Date().toDateString())) return null
  return m
}
