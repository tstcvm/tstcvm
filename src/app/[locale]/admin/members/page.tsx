import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { Badge, Card, EmptyState, inputClass } from '@/components/ui'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatMoney } from '@/lib/format'
import { approveMembership, rejectMembership } from '@/lib/actions/admin'
import type { Membership, MembershipStatus } from '@/lib/types'

export const dynamic = 'force-dynamic'

const TABS: (MembershipStatus | 'all')[] = ['pending', 'active', 'rejected', 'expired', 'all']

export default async function AdminMembersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ status?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { status } = await searchParams
  const active = (status && TABS.includes(status as MembershipStatus) ? status : 'pending') as
    | MembershipStatus
    | 'all'
  const d = getDict(locale)
  const supabase = await createClient()

  let query = supabase
    .from('memberships')
    .select('*, profiles!memberships_user_id_fkey(*)')
    .order('applied_at', { ascending: false })
  if (active !== 'all') query = query.eq('status', active)
  const { data } = await query
  const rows = (data ?? []) as Membership[]

  // ลิงก์สลิปแบบมีลายเซ็น (bucket private)
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

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab}
            href={`${lp(locale, '/admin/members')}?status=${tab}`}
            className={`rounded-full px-3.5 py-1.5 text-sm transition ${
              active === tab
                ? 'bg-crimson text-white'
                : 'border border-line bg-surface text-muted hover:border-gold'
            }`}
          >
            {tab === 'all' ? d.common.all : d.status[tab]}
          </Link>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0 ? (
          <EmptyState>{d.common.none}</EmptyState>
        ) : (
          rows.map((m) => (
            <Card key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{m.profiles?.full_name ?? m.profiles?.email}</p>
                  <p className="text-sm text-muted">{m.profiles?.email}</p>
                  <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-muted">
                    {m.profiles?.member_code && <Badge tone="gold">{m.profiles.member_code}</Badge>}
                    <span>{d.join.types[m.member_type]}</span>
                    <span>· {formatDate(m.applied_at, locale)}</span>
                  </div>
                </div>
                <Badge
                  tone={m.status === 'active' ? 'jade' : m.status === 'pending' ? 'gold' : 'neutral'}
                >
                  {d.status[m.status]}
                </Badge>
              </div>

              <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{d.common.phone}</dt>
                  <dd>{m.profiles?.phone ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{d.register.licenseNo}</dt>
                  <dd>{m.profiles?.license_no ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{d.register.workplace}</dt>
                  <dd className="text-right">{m.profiles?.workplace ?? '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">{d.join.fee}</dt>
                  <dd className="font-semibold">{formatMoney(m.fee_amount, locale)}</dd>
                </div>
                {m.payment_ref && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{d.join.paymentRef}</dt>
                    <dd className="font-mono">{m.payment_ref}</dd>
                  </div>
                )}
                {m.transferred_at && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{d.register.transferredAt}</dt>
                    <dd>{formatDate(m.transferred_at, locale, true)}</dd>
                  </div>
                )}
                {m.end_date && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{d.me.validUntil}</dt>
                    <dd>{formatDate(m.end_date, locale)}</dd>
                  </div>
                )}
              </dl>

              {m.applicant_note && (
                <p className="mt-3 rounded-lg bg-paper px-3 py-2 text-sm text-muted">{m.applicant_note}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {slips[m.id] && (
                  <a
                    href={slips[m.id]}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-crimson hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" /> {d.common.viewSlip}
                  </a>
                )}

                {m.status === 'pending' && (
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={approveMembership} className="flex items-center gap-2">
                      <input type="hidden" name="locale" value={locale} />
                      <input type="hidden" name="id" value={m.id} />
                      <input
                        type="number"
                        name="years"
                        defaultValue={1}
                        min={1}
                        max={10}
                        className="w-16 rounded-lg border border-line px-2 py-1.5 text-sm"
                        aria-label={locale === 'th' ? 'จำนวนปี' : 'years'}
                      />
                      <span className="text-sm text-muted">{locale === 'th' ? 'ปี' : 'yr'}</span>
                      <button className="rounded-lg bg-jade px-4 py-2 text-sm font-semibold text-white hover:opacity-90">
                        {d.admin.approve}
                      </button>
                    </form>

                    <details className="group">
                      <summary className="cursor-pointer list-none rounded-lg border border-line px-4 py-2 text-sm text-muted hover:border-crimson hover:text-crimson">
                        {d.admin.reject}
                      </summary>
                      <form action={rejectMembership} className="mt-3 flex flex-wrap items-center gap-2">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={m.id} />
                        <input
                          name="review_note"
                          placeholder={locale === 'th' ? 'เหตุผล' : 'Reason'}
                          className={`${inputClass} w-64`}
                        />
                        <button className="rounded-lg bg-crimson px-4 py-2 text-sm font-semibold text-white">
                          {d.common.confirm}
                        </button>
                      </form>
                    </details>
                  </div>
                )}
              </div>

              {m.review_note && m.status !== 'pending' && (
                <p className="mt-3 text-sm text-muted">· {m.review_note}</p>
              )}
            </Card>
          ))
        )}
      </div>
    </>
  )
}
