import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Users } from 'lucide-react'
import EventForm from '@/components/admin/EventForm'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import type { EventRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale: raw, id } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const supabase = await createClient()
  const { data } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  if (!data) notFound()

  return (
    <>
      <Link
        href={lp(locale, `/admin/events/${id}/registrations`)}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-gold"
      >
        <Users className="h-4 w-4" /> {d.admin.registrations}
      </Link>
      <EventForm locale={locale} item={data as EventRow} />
    </>
  )
}
