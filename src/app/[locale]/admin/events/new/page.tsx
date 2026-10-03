import EventForm from '@/components/admin/EventForm'
import { isLocale, type Locale } from '@/lib/i18n'

export const dynamic = 'force-dynamic'

export default async function NewEventPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  return <EventForm locale={locale} />
}
