import Link from 'next/link'
import { PageHeader, EmptyState } from '@/components/ui'
import NewsCard from '@/components/NewsCard'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { getPublishedNews } from '@/lib/queries'
import type { NewsCategory } from '@/lib/types'

export const revalidate = 180

const categories: (NewsCategory | 'all')[] = ['all', 'announcement', 'news', 'activity', 'knowledge']

export default async function NewsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ c?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { c } = await searchParams
  const active = (c && categories.includes(c as NewsCategory) ? c : 'all') as NewsCategory | 'all'
  const d = getDict(locale)
  const items = await getPublishedNews(undefined, active)

  return (
    <>
      <PageHeader title={d.news.title}>
        <div className="mt-6 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={cat === 'all' ? lp(locale, '/news') : `${lp(locale, '/news')}?c=${cat}`}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                active === cat
                  ? 'bg-crimson text-white'
                  : 'border border-line bg-surface text-muted hover:border-gold'
              }`}
            >
              {d.news.categories[cat]}
            </Link>
          ))}
        </div>
      </PageHeader>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {items.length === 0 ? (
          <EmptyState>{d.home.noNews}</EmptyState>
        ) : (
          <div className="grid gap-4">
            {items.map((n) => (
              <NewsCard key={n.id} item={n} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
