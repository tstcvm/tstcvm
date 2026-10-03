import { hasSupabase, supabasePublic } from './supabase/public'
import type { EventRow, News, BankInfo, MembershipFees, SocietyInfo } from './types'

export async function getPublishedNews(limit?: number, category?: string) {
  if (!hasSupabase) return [] as News[]
  let q = supabasePublic
    .from('news')
    .select('*')
    .eq('is_published', true)
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
  if (category && category !== 'all') q = q.eq('category', category)
  if (limit) q = q.limit(limit)
  const { data } = await q
  return (data ?? []) as News[]
}

export async function getNewsBySlug(slug: string) {
  if (!hasSupabase) return null
  const { data } = await supabasePublic
    .from('news')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle()
  return (data as News) ?? null
}

export async function getPublicEvents() {
  if (!hasSupabase) return [] as EventRow[]
  const { data } = await supabasePublic
    .from('events')
    .select('*')
    .in('status', ['published', 'closed'])
    .order('starts_at', { ascending: false })
  return (data ?? []) as EventRow[]
}

export async function getUpcomingEvents(limit = 3) {
  if (!hasSupabase) return [] as EventRow[]
  const { data } = await supabasePublic
    .from('events')
    .select('*')
    .in('status', ['published', 'closed'])
    .gte('starts_at', new Date(Date.now() - 12 * 3600 * 1000).toISOString())
    .order('starts_at', { ascending: true })
    .limit(limit)
  return (data ?? []) as EventRow[]
}

export async function getEventBySlug(slug: string) {
  if (!hasSupabase) return null
  const { data } = await supabasePublic.from('events').select('*').eq('slug', slug).maybeSingle()
  const row = (data as EventRow) ?? null
  if (!row || row.status === 'draft') return null
  return row
}

export async function getSeatsTaken(eventId: string) {
  if (!hasSupabase) return 0
  const { data } = await supabasePublic.rpc('event_seats_taken', { eid: eventId })
  return (data as number) ?? 0
}

export async function getSettings() {
  const fallback = {
    membership_fees: { regular: 500, student: 200, associate: 500, honorary: 0, lifetime: 5000 } as MembershipFees,
    bank: {} as BankInfo,
    society: { email: 'tstcvm.th@gmail.com' } as SocietyInfo,
  }
  if (!hasSupabase) return fallback
  const { data } = await supabasePublic.from('settings').select('key, value')
  const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]))
  return {
    membership_fees: (map.membership_fees ?? fallback.membership_fees) as MembershipFees,
    bank: (map.bank ?? fallback.bank) as BankInfo,
    society: (map.society ?? fallback.society) as SocietyInfo,
  }
}

export function siteUrl() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3010'
}
