import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { Badge, EmptyState } from '@/components/ui'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import { formatDateRange } from '@/lib/format'
import type { EventRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('*').order('starts_at', { ascending: false })
  const rows = (data ?? []) as EventRow[]

  const counts = await Promise.all(
    rows.map(async (e) => {
      const { count } = await supabase
        .from('event_registrations')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', e.id)
        .neq('status', 'cancelled')
      return [e.id, count ?? 0] as const
    })
  )
  const regCount = Object.fromEntries(counts)

  return (
    <>
      <Link
        href={lp(locale, '/admin/events/new')}
        className="inline-flex items-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson-dark"
      >
        <Plus className="h-4 w-4" /> {d.admin.newEvent}
      </Link>

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <EmptyState>{d.common.none}</EmptyState>
        ) : (
          rows.map((e) => (
            <div
              key={e.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <div className="min-w-0">
                <Link href={lp(locale, `/admin/events/${e.id}`)} className="font-medium hover:text-crimson">
                  {e.title_th}
                </Link>
                <p className="text-xs text-muted">{formatDateRange(e.starts_at, e.ends_at, locale)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={e.status === 'published' ? 'jade' : 'neutral'}>{d.status[e.status]}</Badge>
                <Link
                  href={lp(locale, `/admin/events/${e.id}/registrations`)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-gold"
                >
                  <Users className="h-4 w-4" /> {regCount[e.id]}
                  {e.capacity ? `/${e.capacity}` : ''}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
