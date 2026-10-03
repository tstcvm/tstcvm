import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui'
import { getDict, isLocale, lp, pick, type Locale } from '@/lib/i18n'
import { formatDate } from '@/lib/format'
import { getNewsBySlug } from '@/lib/queries'
import type { Metadata } from 'next'

export const revalidate = 180

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const item = await getNewsBySlug(slug)
  if (!item) return {}
  return {
    title: pick(item, 'title', locale),
    description: pick(item, 'excerpt', locale) || undefined,
    openGraph: { images: item.cover_url ? [item.cover_url] : undefined },
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const item = await getNewsBySlug(slug)
  if (!item) notFound()

  const body = pick(item, 'body', locale)

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href={lp(locale, '/news')}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-crimson"
      >
        <ArrowLeft className="h-4 w-4" /> {d.news.title}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Badge tone={item.category === 'announcement' ? 'crimson' : 'gold'}>
          {d.news.categories[item.category]}
        </Badge>
        <span className="text-xs text-muted">
          {d.news.publishedOn} {formatDate(item.published_at ?? item.created_at, locale)}
        </span>
      </div>

      <h1 className="mt-3 text-2xl font-bold leading-snug text-crimson-dark sm:text-3xl">
        {pick(item, 'title', locale)}
      </h1>
      <div className="rule-gold mt-4 h-0.5 w-24 rounded-full" />

      {item.cover_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.cover_url} alt="" className="mt-6 w-full rounded-xl object-cover" />
      )}

      {pick(item, 'excerpt', locale) && (
        <p className="mt-6 text-base font-medium leading-relaxed text-muted">
          {pick(item, 'excerpt', locale)}
        </p>
      )}

      <div className="prose-tcvm mt-6 text-[15px]">
        {body
          .split(/\n{2,}/)
          .filter(Boolean)
          .map((para, i) => (
            <p key={i} className="whitespace-pre-line">
              {para}
            </p>
          ))}
      </div>
    </article>
  )
}
