import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ArrowLeft, CalendarDays, MapPin, Wifi, Award, Users, Ticket } from 'lucide-react'
import { Badge, ButtonLink, Card } from '@/components/ui'
import { getDict, isLocale, lp, pick, type Locale } from '@/lib/i18n'
import { formatDateRange, formatDate, formatMoney, isUpcoming } from '@/lib/format'
import { getEventBySlug, getSeatsTaken } from '@/lib/queries'

export const revalidate = 60

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const event = await getEventBySlug(slug)
  if (!event) return {}
  return {
    title: pick(event, 'title', locale),
    description: pick(event, 'summary', locale) || undefined,
    openGraph: { images: event.cover_url ? [event.cover_url] : undefined },
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const taken = await getSeatsTaken(event.id)
  const seatsLeft = event.capacity ? Math.max(0, event.capacity - taken) : null
  const now = Date.now()
  const opensOk = !event.register_opens_at || new Date(event.register_opens_at).getTime() <= now
  const closesOk = !event.register_closes_at || new Date(event.register_closes_at).getTime() >= now
  const canRegister =
    event.status === 'published' && isUpcoming(event) && opensOk && closesOk && seatsLeft !== 0

  const description = pick(event, 'description', locale)

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Link
        href={lp(locale, '/events')}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-crimson"
      >
        <ArrowLeft className="h-4 w-4" /> {d.events.title}
      </Link>

      {event.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={event.cover_url} alt="" className="mt-6 h-56 w-full rounded-xl object-cover" />
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {event.status === 'closed' && <Badge tone="neutral">{d.events.registerClosed}</Badge>}
        {event.ce_credits > 0 && (
          <Badge tone="gold">
            {d.events.ce} {event.ce_credits}
          </Badge>
        )}
        {event.has_certificate && <Badge tone="jade">{d.events.hasCertificate}</Badge>}
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug text-crimson-dark sm:text-3xl">
        {pick(event, 'title', locale)}
      </h1>
      <div className="rule-gold mt-4 h-0.5 w-24 rounded-full" />
      {pick(event, 'summary', locale) && (
        <p className="mt-5 leading-relaxed text-muted">{pick(event, 'summary', locale)}</p>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="order-2 lg:order-1">
          {description && (
            <div className="prose-tcvm text-[15px]">
              {description
                .split(/\n{2,}/)
                .filter(Boolean)
                .map((p, i) => (
                  <p key={i} className="whitespace-pre-line">
                    {p}
                  </p>
                ))}
            </div>
          )}

          {event.agenda?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-crimson-dark">{d.events.agenda}</h2>
              <ol className="mt-4 space-y-3">
                {event.agenda.map((item, i) => (
                  <li key={i} className="flex gap-4 rounded-lg border border-line bg-surface p-4">
                    {item.time && (
                      <span className="w-24 shrink-0 text-sm font-semibold text-gold">{item.time}</span>
                    )}
                    <span className="text-sm">
                      <span className="block font-medium">
                        {locale === 'en' ? item.title_en || item.title_th : item.title_th}
                      </span>
                      {item.speaker && <span className="text-muted">{item.speaker}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {event.speakers?.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-bold text-crimson-dark">{d.events.speakers}</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {event.speakers.map((s, i) => (
                  <div key={i} className="flex gap-3 rounded-lg border border-line bg-surface p-4">
                    {s.photo_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photo_url} alt="" className="h-14 w-14 rounded-full object-cover" />
                    )}
                    <div className="text-sm">
                      <p className="font-semibold">{locale === 'en' ? s.name_en || s.name : s.name}</p>
                      {s.affiliation && <p className="text-muted">{s.affiliation}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* กล่องข้อมูล + ปุ่มลงทะเบียน */}
        <aside className="order-1 lg:order-2">
          <Card className="sticky top-20">
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{formatDateRange(event.starts_at, event.ends_at, locale)}</span>
              </div>
              <div className="flex items-start gap-2.5">
                {event.is_online ? (
                  <Wifi className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                ) : (
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                )}
                <span>{event.is_online ? d.events.online : pick(event, 'venue', locale) || '—'}</span>
              </div>
              {event.capacity && (
                <div className="flex items-start gap-2.5">
                  <Users className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    {seatsLeft === 0
                      ? d.events.full
                      : d.events.seatsLeft.replace('{n}', String(seatsLeft))}
                  </span>
                </div>
              )}
              {event.ce_credits > 0 && (
                <div className="flex items-start gap-2.5">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    {d.events.ce} {event.ce_credits}
                  </span>
                </div>
              )}
              {event.register_closes_at && (
                <div className="flex items-start gap-2.5">
                  <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <span>
                    {d.events.registerClosesAt} {formatDate(event.register_closes_at, locale, true)}
                  </span>
                </div>
              )}
            </dl>

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">{d.events.fee}</p>
              <ul className="mt-2 space-y-1 text-sm">
                <li className="flex justify-between">
                  <span className="text-muted">{d.events.feeMember}</span>
                  <span className="font-semibold">{formatMoney(event.fee_member, locale)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted">{d.events.feeNonmember}</span>
                  <span className="font-semibold">{formatMoney(event.fee_nonmember, locale)}</span>
                </li>
                {event.fee_student > 0 && (
                  <li className="flex justify-between">
                    <span className="text-muted">{d.events.feeStudent}</span>
                    <span className="font-semibold">{formatMoney(event.fee_student, locale)}</span>
                  </li>
                )}
              </ul>
            </div>

            <div className="mt-5">
              {canRegister ? (
                <ButtonLink href={lp(locale, `/events/${event.slug}/register`)} className="w-full">
                  {d.events.register}
                </ButtonLink>
              ) : (
                <p className="rounded-lg bg-line/40 px-4 py-3 text-center text-sm text-muted">
                  {seatsLeft === 0 ? d.events.full : d.events.registerClosed}
                </p>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
