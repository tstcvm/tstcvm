import { PageHeader, EmptyState } from '@/components/ui'
import EventCard from '@/components/EventCard'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { getPublicEvents } from '@/lib/queries'
import { isUpcoming } from '@/lib/format'

export const revalidate = 180

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const all = await getPublicEvents()
  const upcoming = all.filter(isUpcoming).sort((a, b) => a.starts_at.localeCompare(b.starts_at))
  const past = all.filter((e) => !isUpcoming(e))

  return (
    <>
      <PageHeader title={d.events.title} />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-lg font-bold text-crimson-dark">{d.events.upcoming}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {upcoming.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState>{d.home.noEvents}</EmptyState>
            </div>
          ) : (
            upcoming.map((e) => <EventCard key={e.id} event={e} locale={locale} />)
          )}
        </div>

        {past.length > 0 && (
          <>
            <h2 className="mt-14 text-lg font-bold text-crimson-dark">{d.events.past}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {past.map((e) => (
                <EventCard key={e.id} event={e} locale={locale} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  )
}
