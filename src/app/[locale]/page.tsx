import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import NewsCard from '@/components/NewsCard'
import EventCard from '@/components/EventCard'
import { ButtonLink, EmptyState } from '@/components/ui'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { getPublishedNews, getUpcomingEvents } from '@/lib/queries'

export const revalidate = 300

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)

  const [events, news] = await Promise.all([getUpcomingEvents(3), getPublishedNews(4)])

  return (
    <>
      {/* hero */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-crimson-soft px-3 py-1 text-xs font-semibold text-crimson">
            <Sparkles className="h-3.5 w-3.5" /> TSTCVM
          </p>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-tight text-crimson-dark sm:text-4xl">
            {d.home.heroLead}
          </h1>
          <p className="mt-2 max-w-3xl text-sm font-medium text-gold">{d.site.fullEn}</p>
          <div className="rule-gold mt-5 h-0.5 w-28 rounded-full" />
          <p className="mt-5 max-w-2xl leading-relaxed text-muted">{d.home.heroBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href={lp(locale, '/join')}>{d.home.ctaJoin}</ButtonLink>
            <ButtonLink href={lp(locale, '/events')} variant="outline">
              {d.home.ctaEvents}
            </ButtonLink>
          </div>
        </div>
      </section>

      {/* งานสัมมนา */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold text-crimson-dark sm:text-2xl">{d.home.upcomingEvents}</h2>
          <Link
            href={lp(locale, '/events')}
            className="inline-flex items-center gap-1 text-sm font-semibold text-crimson hover:underline"
          >
            {d.common.all} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rule-gold mt-3 h-0.5 w-20 rounded-full" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {events.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState>{d.home.noEvents}</EmptyState>
            </div>
          ) : (
            events.map((e) => <EventCard key={e.id} event={e} locale={locale} />)
          )}
        </div>
      </section>

      {/* ข่าวสาร */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-bold text-crimson-dark sm:text-2xl">{d.home.latestNews}</h2>
            <Link
              href={lp(locale, '/news')}
              className="inline-flex items-center gap-1 text-sm font-semibold text-crimson hover:underline"
            >
              {d.common.all} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="rule-gold mt-3 h-0.5 w-20 rounded-full" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {news.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState>{d.home.noNews}</EmptyState>
              </div>
            ) : (
              news.map((n) => <NewsCard key={n.id} item={n} locale={locale} />)
            )}
          </div>
        </div>
      </section>

      {/* สิทธิประโยชน์ */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <h2 className="text-xl font-bold text-crimson-dark sm:text-2xl">{d.home.whyJoin}</h2>
        <div className="rule-gold mt-3 h-0.5 w-20 rounded-full" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {d.home.benefits.map((b) => (
            <div key={b.title} className="rounded-xl border border-line bg-surface p-5">
              <h3 className="font-semibold text-crimson">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <ButtonLink href={lp(locale, '/join')}>{d.home.ctaJoin}</ButtonLink>
        </div>
      </section>
    </>
  )
}
