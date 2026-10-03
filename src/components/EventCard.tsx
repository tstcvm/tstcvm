import Link from 'next/link'
import { CalendarDays, MapPin, Wifi, Award } from 'lucide-react'
import { Badge } from './ui'
import { getDict, lp, pick, type Locale } from '@/lib/i18n'
import { formatDateRange, formatMoney, isUpcoming } from '@/lib/format'
import type { EventRow } from '@/lib/types'

export default function EventCard({ event, locale }: { event: EventRow; locale: Locale }) {
  const d = getDict(locale)
  const upcoming = isUpcoming(event)
  const venue = event.is_online ? d.events.online : pick(event, 'venue', locale)

  return (
    <Link
      href={lp(locale, `/events/${event.slug}`)}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-gold"
    >
      {event.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.cover_url} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div className="h-2 w-full bg-gradient-to-r from-crimson to-gold" />
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {event.status === 'closed' && <Badge tone="neutral">{d.events.registerClosed}</Badge>}
          {upcoming && event.status === 'published' && (
            <Badge tone="jade">{d.events.upcoming}</Badge>
          )}
          {event.ce_credits > 0 && (
            <Badge tone="gold">
              {d.events.ce} {event.ce_credits}
            </Badge>
          )}
        </div>
        <h3 className="mt-2 font-semibold leading-snug group-hover:text-crimson">
          {pick(event, 'title', locale)}
        </h3>
        {pick(event, 'summary', locale) && (
          <p className="mt-1.5 line-clamp-2 text-sm text-muted">{pick(event, 'summary', locale)}</p>
        )}
        <dl className="mt-4 space-y-1.5 text-sm text-muted">
          <div className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <span>{formatDateRange(event.starts_at, event.ends_at, locale)}</span>
          </div>
          {venue && (
            <div className="flex items-start gap-2">
              {event.is_online ? (
                <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              ) : (
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              )}
              <span className="line-clamp-1">{venue}</span>
            </div>
          )}
          {event.has_certificate && (
            <div className="flex items-start gap-2">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{d.events.hasCertificate}</span>
            </div>
          )}
        </dl>
        <p className="mt-4 text-sm font-semibold text-crimson">
          {event.fee_member === 0 && event.fee_nonmember === 0
            ? d.common.free
            : `${d.events.feeMember} ${formatMoney(event.fee_member, locale)} · ${d.events.feeNonmember} ${formatMoney(event.fee_nonmember, locale)}`}
        </p>
      </div>
    </Link>
  )
}
