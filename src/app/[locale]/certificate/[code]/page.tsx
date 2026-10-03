import { notFound } from 'next/navigation'
import Logo from '@/components/Logo'
import PrintButton from '@/components/PrintButton'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { formatDateRange } from '@/lib/format'
import { supabasePublic, hasSupabase } from '@/lib/supabase/public'

export const dynamic = 'force-dynamic'

type Row = {
  attendee_name: string
  event_title_th: string
  event_title_en: string | null
  starts_at: string
  ends_at: string | null
  ce_credits: number
  issued_at: string | null
}

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>
}) {
  const { locale: raw, code } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)

  if (!hasSupabase) notFound()
  const { data } = await supabasePublic.rpc('verify_certificate', { code })
  const row = (data as Row[] | null)?.[0]
  if (!row) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <p className="text-lg font-semibold text-crimson">{d.cert.invalid}</p>
        <p className="mt-2 font-mono text-sm text-muted">{code}</p>
      </div>
    )
  }

  const title = locale === 'en' ? row.event_title_en || row.event_title_th : row.event_title_th

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border-4 border-double border-gold bg-surface p-8 text-center sm:p-14">
        <Logo className="mx-auto h-16 w-16" />
        <p className="mt-4 text-sm font-semibold tracking-widest text-gold">TSTCVM</p>
        <p className="text-xs text-muted">{d.site.name}</p>

        <h1 className="mt-8 text-xl font-bold tracking-wide text-crimson-dark sm:text-2xl">
          {d.cert.title}
        </h1>
        <div className="rule-gold mx-auto mt-4 h-0.5 w-28 rounded-full" />

        <p className="mt-8 text-sm text-muted">{d.cert.presentedTo}</p>
        <p className="mt-2 text-2xl font-bold sm:text-3xl">{row.attendee_name}</p>

        <p className="mt-6 text-sm text-muted">{d.cert.forAttending}</p>
        <p className="mt-2 text-lg font-semibold leading-snug text-crimson-dark">{title}</p>
        <p className="mt-2 text-sm text-muted">
          {formatDateRange(row.starts_at, row.ends_at, locale)}
        </p>

        {row.ce_credits > 0 && (
          <p className="mt-6 inline-block rounded-full bg-gold-soft px-4 py-1.5 text-sm font-semibold text-gold">
            {d.cert.ceEarned}: {row.ce_credits}
          </p>
        )}

        <div className="mt-10 border-t border-line pt-5 text-xs text-muted">
          <p>
            {d.cert.code}: <span className="font-mono font-semibold">{code}</span>
          </p>
        </div>
      </div>

      <div className="no-print mt-6 text-center">
        <PrintButton label={d.cert.print} />
      </div>
    </div>
  )
}
