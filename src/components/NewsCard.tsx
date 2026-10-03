import Link from 'next/link'
import { Pin } from 'lucide-react'
import { Badge } from './ui'
import { getDict, lp, pick, type Locale } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import type { News } from '@/lib/types'

export default function NewsCard({ item, locale }: { item: News; locale: Locale }) {
  const d = getDict(locale)
  return (
    <Link
      href={lp(locale, `/news/${item.slug}`)}
      className="group flex gap-4 rounded-xl border border-line bg-surface p-4 transition hover:border-gold"
    >
      {item.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.cover_url}
          alt=""
          className="hidden h-24 w-32 shrink-0 rounded-lg object-cover sm:block"
        />
      )}
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={item.category === 'announcement' ? 'crimson' : 'gold'}>
            {d.news.categories[item.category]}
          </Badge>
          {item.is_pinned && (
            <span className="inline-flex items-center gap-1 text-xs text-gold">
              <Pin className="h-3 w-3" /> {d.news.pinned}
            </span>
          )}
          <span className="text-xs text-muted">{formatDate(item.published_at ?? item.created_at, locale)}</span>
        </div>
        <h3 className="mt-1.5 font-semibold leading-snug group-hover:text-crimson">
          {pick(item, 'title', locale)}
        </h3>
        {pick(item, 'excerpt', locale) && (
          <p className="mt-1 line-clamp-2 text-sm text-muted">{pick(item, 'excerpt', locale)}</p>
        )}
      </div>
    </Link>
  )
}
