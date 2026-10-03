import { notFound } from 'next/navigation'
import NewsForm from '@/components/admin/NewsForm'
import { isLocale, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import type { News } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditNewsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale: raw, id } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const supabase = await createClient()
  const { data } = await supabase.from('news').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()
  return <NewsForm locale={locale} item={data as News} />
}
