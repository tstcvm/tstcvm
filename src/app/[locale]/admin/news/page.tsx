import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Badge, EmptyState } from '@/components/ui'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { News } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const supabase = await createClient()
  const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false })
  const rows = (data ?? []) as News[]

  return (
    <>
      <Link
        href={lp(locale, '/admin/news/new')}
        className="inline-flex items-center gap-2 rounded-lg bg-crimson px-4 py-2.5 text-sm font-semibold text-white hover:bg-crimson-dark"
      >
        <Plus className="h-4 w-4" /> {d.admin.newNews}
      </Link>

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <EmptyState>{d.common.none}</EmptyState>
        ) : (
          rows.map((n) => (
            <Link
              key={n.id}
              href={lp(locale, `/admin/news/${n.id}`)}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4 hover:border-gold"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{n.title_th}</p>
                <p className="text-xs text-muted">
                  {d.news.categories[n.category]} · {formatDate(n.published_at ?? n.created_at, locale)}
                </p>
              </div>
              <div className="flex gap-2">
                {n.is_pinned && <Badge tone="gold">{d.news.pinned}</Badge>}
                <Badge tone={n.is_published ? 'jade' : 'neutral'}>
                  {n.is_published ? d.status.published : d.status.draft}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  )
}
