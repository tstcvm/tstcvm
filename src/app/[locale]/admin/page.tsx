import Link from 'next/link'
import { Clock, Users, CalendarDays, Receipt } from 'lucide-react'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)
  const [pendingMembers, activeMembers, upcoming, pendingPayments] = await Promise.all([
    supabase.from('memberships').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('memberships')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .or(`end_date.is.null,end_date.gte.${today}`),
    supabase
      .from('events')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published')
      .gte('starts_at', new Date().toISOString()),
    supabase
      .from('event_registrations')
      .select('id', { count: 'exact', head: true })
      .eq('payment_status', 'pending'),
  ])

  const cards = [
    {
      label: d.admin.pendingMembers,
      value: pendingMembers.count ?? 0,
      href: '/admin/members?status=pending',
      Icon: Clock,
      tone: 'text-gold',
    },
    {
      label: d.admin.totalMembers,
      value: activeMembers.count ?? 0,
      href: '/admin/members?status=active',
      Icon: Users,
      tone: 'text-jade',
    },
    {
      label: d.admin.upcomingEvents,
      value: upcoming.count ?? 0,
      href: '/admin/events',
      Icon: CalendarDays,
      tone: 'text-crimson',
    },
    {
      label: d.admin.pendingPayments,
      value: pendingPayments.count ?? 0,
      href: '/admin/events',
      Icon: Receipt,
      tone: 'text-gold',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map(({ label, value, href, Icon, tone }) => (
        <Link
          key={label}
          href={lp(locale, href)}
          className="rounded-xl border border-line bg-surface p-5 transition hover:border-gold"
        >
          <Icon className={`h-5 w-5 ${tone}`} />
          <p className="mt-3 text-3xl font-bold">{value}</p>
          <p className="mt-1 text-sm text-muted">{label}</p>
        </Link>
      ))}
    </div>
  )
}
