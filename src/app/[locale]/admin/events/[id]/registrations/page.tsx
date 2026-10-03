import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Award, Check, ExternalLink } from 'lucide-react'
import { Badge, EmptyState } from '@/components/ui'
import ExportCsvButton from '@/components/admin/ExportCsvButton'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatMoney } from '@/lib/format'
import { issueCertificates, setPaymentStatus, toggleCheckIn } from '@/lib/actions/admin'
import type { EventRow, Registration } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegistrationsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale: raw, id } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const supabase = await createClient()

  const { data: eventData } = await supabase.from('events').select('*').eq('id', id).maybeSingle()
  const event = eventData as EventRow | null
  if (!event) notFound()

  const { data } = await supabase
    .from('event_registrations')
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: true })
  const rows = (data ?? []) as Registration[]

  const slipEntries = await Promise.all(
    rows
      .filter((r) => r.payment_slip_path)
      .map(async (r) => {
        const { data: signed } = await supabase.storage
          .from('slips')
          .createSignedUrl(r.payment_slip_path!, 60 * 60)
        return [r.id, signed?.signedUrl ?? ''] as const
      })
  )
  const slips = Object.fromEntries(slipEntries)
  const back = lp(locale, `/admin/events/${id}/registrations`)

  const csv = rows.map((r, i) => ({
    ลำดับ: i + 1,
    ชื่อ: r.attendee_name,
    อีเมล: r.attendee_email ?? '',
    โทรศัพท์: r.attendee_phone ?? '',
    เลขใบประกอบวิชาชีพ: r.attendee_license_no ?? '',
    สถานที่ทำงาน: r.attendee_workplace ?? '',
    อัตรา: r.rate_type,
    ค่าลงทะเบียน: r.fee_amount,
    การชำระเงิน: r.payment_status,
    สถานะ: r.status,
    เช็กชื่อ: r.checked_in_at ? 'yes' : '',
    รหัสใบรับรอง: r.certificate_code ?? '',
  }))

  const checkedIn = rows.filter((r) => r.checked_in_at).length
  const paid = rows.filter((r) => r.payment_status === 'paid' || r.payment_status === 'waived').length

  return (
    <>
      <Link
        href={lp(locale, `/admin/events/${id}`)}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-crimson"
      >
        <ArrowLeft className="h-4 w-4" /> {event.title_th}
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Badge tone="neutral">
          {rows.length}
          {event.capacity ? `/${event.capacity}` : ''} {d.admin.registrations}
        </Badge>
        <Badge tone="jade">
          {paid} {d.status.paid}
        </Badge>
        <Badge tone="gold">
          {checkedIn} {d.me.checkedIn}
        </Badge>
        <div className="ml-auto flex flex-wrap gap-2">
          <ExportCsvButton rows={csv} filename={`${event.slug}-registrations.csv`} label={d.admin.exportCsv} />
          {event.has_certificate && (
            <form action={issueCertificates}>
              <input type="hidden" name="locale" value={locale} />
              <input type="hidden" name="event_id" value={id} />
              <input type="hidden" name="back" value={back} />
              <button className="inline-flex items-center gap-2 rounded-lg border border-crimson px-4 py-2 text-sm font-semibold text-crimson hover:bg-crimson-soft">
                <Award className="h-4 w-4" /> {d.admin.issueCertificate}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <EmptyState>{d.common.none}</EmptyState>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{r.attendee_name}</p>
                  <p className="text-sm text-muted">
                    {r.attendee_email} {r.attendee_phone && `· ${r.attendee_phone}`}
                  </p>
                  {r.attendee_workplace && <p className="text-xs text-muted">{r.attendee_workplace}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={r.rate_type === 'member' ? 'jade' : 'neutral'}>
                    {r.rate_type === 'member'
                      ? d.events.feeMember
                      : r.rate_type === 'student'
                        ? d.events.feeStudent
                        : d.events.feeNonmember}
                  </Badge>
                  <Badge tone={r.status === 'confirmed' ? 'jade' : 'gold'}>{d.status[r.status]}</Badge>
                  <Badge
                    tone={r.payment_status === 'paid' || r.payment_status === 'waived' ? 'jade' : 'neutral'}
                  >
                    {d.status[r.payment_status as keyof typeof d.status] ?? r.payment_status}
                  </Badge>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="text-muted">{formatMoney(r.fee_amount, locale)}</span>
                {r.transferred_at && (
                  <span className="text-muted">· {formatDate(r.transferred_at, locale, true)}</span>
                )}
                {slips[r.id] && (
                  <a
                    href={slips[r.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 font-semibold text-crimson hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> {d.common.viewSlip}
                  </a>
                )}

                {r.payment_status !== 'paid' && r.payment_status !== 'waived' && (
                  <form action={setPaymentStatus}>
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="payment_status" value="paid" />
                    <input type="hidden" name="back" value={back} />
                    <button className="rounded-lg bg-jade px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90">
                      {d.admin.markPaid}
                    </button>
                  </form>
                )}

                <form action={toggleCheckIn} className="ml-auto">
                  <input type="hidden" name="locale" value={locale} />
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="checked" value={r.checked_in_at ? '1' : '0'} />
                  <input type="hidden" name="back" value={back} />
                  <button
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      r.checked_in_at
                        ? 'bg-jade-soft text-jade'
                        : 'border border-line text-muted hover:border-crimson hover:text-crimson'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    {r.checked_in_at ? d.admin.undoCheckIn : d.admin.checkIn}
                  </button>
                </form>
              </div>

              {r.certificate_code && (
                <p className="mt-2 font-mono text-xs text-gold">
                  <Link href={lp(locale, `/certificate/${r.certificate_code}`)} className="hover:underline">
                    {r.certificate_code}
                  </Link>
                </p>
              )}
              {r.note && <p className="mt-2 rounded-lg bg-paper px-3 py-2 text-sm text-muted">{r.note}</p>}
            </div>
          ))
        )}
      </div>
    </>
  )
}
