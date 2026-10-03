import Link from 'next/link'
import { Award, BadgeCheck, CalendarDays, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { PageHeader, Card, Badge, ButtonLink, EmptyState } from '@/components/ui'
import ProfileForm from '@/components/ProfileForm'
import { getDict, isLocale, lp, pick, type Locale } from '@/lib/i18n'
import { requireSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatDateRange, formatMoney } from '@/lib/format'
import { cancelRegistration } from '@/lib/actions/registration'
import type { Membership, Registration } from '@/lib/types'

export const dynamic = 'force-dynamic'

const MESSAGES: Record<string, { th: string; en: string }> = {
  applied: { th: 'ส่งใบสมัครสมาชิกแล้ว รอผู้ดูแลตรวจสอบ', en: 'Application submitted — pending review' },
  saved: { th: 'บันทึกโปรไฟล์แล้ว', en: 'Profile saved' },
  registered: { th: 'ลงทะเบียนงานแล้ว รอตรวจสอบการชำระเงิน', en: 'Registered — payment pending review' },
  cancelled: { th: 'ยกเลิกการลงทะเบียนแล้ว', en: 'Registration cancelled' },
  pending: { th: 'คุณมีใบสมัครที่รออนุมัติอยู่แล้ว', en: 'You already have a pending application' },
  error: { th: 'บันทึกไม่สำเร็จ', en: 'Could not save' },
}

export default async function MePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ msg?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { msg } = await searchParams
  const d = getDict(locale)
  const session = await requireSession(locale, '/me')
  const supabase = await createClient()

  const [{ data: memberships }, { data: regs }] = await Promise.all([
    supabase
      .from('memberships')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false }),
    supabase
      .from('event_registrations')
      .select('*, events(*)')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false }),
  ])

  const list = (memberships ?? []) as Membership[]
  const current = list.find(
    (m) => m.status === 'active' && (!m.end_date || new Date(m.end_date) >= new Date(new Date().toDateString()))
  )
  const pending = list.find((m) => m.status === 'pending')
  const registrations = (regs ?? []) as Registration[]
  const profile = session.profile

  return (
    <>
      <PageHeader title={d.me.title}>
        <div className="mt-5 flex items-center gap-4">
          {profile?.avatar_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full border border-line" />
          )}
          <div>
            <p className="font-semibold">{profile?.full_name ?? session.email}</p>
            <p className="text-sm text-muted">{session.email}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {profile?.member_code && <Badge tone="gold">{profile.member_code}</Badge>}
              {profile?.role !== 'user' && <Badge tone="crimson">{profile?.role}</Badge>}
            </div>
          </div>
        </div>
      </PageHeader>

      <div className="mx-auto max-w-4xl space-y-10 px-4 py-10">
        {msg && MESSAGES[msg] && (
          <p className="rounded-lg border border-jade/30 bg-jade-soft px-4 py-3 text-sm text-jade">
            {MESSAGES[msg][locale]}
          </p>
        )}

        {/* สถานะสมาชิก */}
        <section>
          <h2 className="text-lg font-bold text-crimson-dark">{d.me.membership}</h2>
          <div className="rule-gold mt-3 h-0.5 w-16 rounded-full" />
          <Card className="mt-5">
            {current ? (
              <>
                <p className="flex items-center gap-2 font-semibold text-jade">
                  <BadgeCheck className="h-5 w-5" /> {d.status.active} · {d.join.types[current.member_type]}
                </p>
                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{d.me.memberCode}</dt>
                    <dd className="font-mono font-semibold">{profile?.member_code ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">{d.me.validUntil}</dt>
                    <dd>{current.end_date ? formatDate(current.end_date, locale) : '—'}</dd>
                  </div>
                </dl>
                <div className="mt-5">
                  <ButtonLink href={lp(locale, '/members')} variant="outline">
                    {d.nav.members}
                  </ButtonLink>
                </div>
              </>
            ) : pending ? (
              <>
                <p className="flex items-center gap-2 font-semibold text-gold">
                  <Clock className="h-5 w-5" /> {d.status.pending}
                </p>
                <p className="mt-2 text-sm text-muted">{d.join.submittedBody}</p>
                <p className="mt-3 text-sm">
                  {d.join.fee}: <strong>{formatMoney(pending.fee_amount, locale)}</strong> ·{' '}
                  {d.join.types[pending.member_type]}
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">{d.me.notMember}</p>
                <div className="mt-4">
                  <ButtonLink href={lp(locale, '/join')}>{d.me.applyNow}</ButtonLink>
                </div>
              </>
            )}

            {list.length > 1 && (
              <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm text-muted">
                {list.map((m) => (
                  <li key={m.id} className="flex flex-wrap justify-between gap-2">
                    <span>
                      {d.join.types[m.member_type]} · {formatDate(m.applied_at, locale)}
                    </span>
                    <Badge tone={m.status === 'active' ? 'jade' : m.status === 'pending' ? 'gold' : 'neutral'}>
                      {d.status[m.status]}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </section>

        {/* งานที่ลงทะเบียน */}
        <section>
          <h2 className="text-lg font-bold text-crimson-dark">{d.me.myEvents}</h2>
          <div className="rule-gold mt-3 h-0.5 w-16 rounded-full" />
          <div className="mt-5 space-y-4">
            {registrations.length === 0 ? (
              <EmptyState>{d.me.noEvents}</EmptyState>
            ) : (
              registrations.map((r) => (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={lp(locale, `/events/${r.events?.slug}`)}
                        className="font-semibold hover:text-crimson"
                      >
                        {r.events ? pick(r.events, 'title', locale) : '—'}
                      </Link>
                      {r.events && (
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                          <CalendarDays className="h-4 w-4 text-gold" />
                          {formatDateRange(r.events.starts_at, r.events.ends_at, locale)}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={r.status === 'confirmed' ? 'jade' : r.status === 'cancelled' ? 'neutral' : 'gold'}>
                        {d.status[r.status]}
                      </Badge>
                      <Badge tone={r.payment_status === 'paid' || r.payment_status === 'waived' ? 'jade' : 'neutral'}>
                        {d.status[r.payment_status as keyof typeof d.status] ?? r.payment_status}
                      </Badge>
                      {r.checked_in_at && (
                        <Badge tone="jade">
                          <CheckCircle2 className="mr-1 inline h-3 w-3" />
                          {d.me.checkedIn}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                    <span className="text-muted">
                      {d.events.fee}: {formatMoney(r.fee_amount, locale)}
                    </span>
                    {r.certificate_code && (
                      <Link
                        href={lp(locale, `/certificate/${r.certificate_code}`)}
                        className="inline-flex items-center gap-1.5 font-semibold text-crimson hover:underline"
                      >
                        <Award className="h-4 w-4" /> {d.me.viewCertificate}
                      </Link>
                    )}
                    {r.status !== 'cancelled' && (
                      <form action={cancelRegistration} className="ml-auto">
                        <input type="hidden" name="locale" value={locale} />
                        <input type="hidden" name="id" value={r.id} />
                        <button className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-crimson">
                          <XCircle className="h-4 w-4" /> {d.events.cancelReg}
                        </button>
                      </form>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* แก้ไขโปรไฟล์ */}
        <section>
          <h2 className="text-lg font-bold text-crimson-dark">{d.me.editProfile}</h2>
          <div className="rule-gold mt-3 h-0.5 w-16 rounded-full" />
          <Card className="mt-5">
            <ProfileForm locale={locale} profile={profile} />
          </Card>
        </section>
      </div>
    </>
  )
}
