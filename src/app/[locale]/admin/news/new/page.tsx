import NewsForm from '@/components/admin/NewsForm'
import { isLocale, type Locale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function NewNewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  return <NewsForm locale={locale} />
}
