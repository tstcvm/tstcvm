import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { PageHeader, Card, ButtonLink, Badge } from '@/components/ui'
import RegisterForm from '@/components/RegisterForm'
import { getDict, isLocale, lp, pick, type Locale } from '@/lib/i18n'
import { requireSession, getActiveMembership } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/queries'
import { formatDateRange, formatMoney } from '@/lib/format'
import type { EventRow, RateType, Registration } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: raw, slug } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const session = await requireSession(locale, `/events/${slug}/register`)

  const supabase = await createClient()
  const { data: eventData } = await supabase.from('events').select('*').eq('slug', slug).maybeSingle()
  const event = eventData as EventRow | null
  if (!event || event.status === 'draft') notFound()

  const [{ bank }, membership, { data: existing }] = await Promise.all([
    getSettings(),
    getActiveMembership(session.userId),
    supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', event.id)
      .eq('user_id', session.userId)
      .maybeSingle(),
  ])

  const reg = existing as Registration | null
  const rateType: RateType = membership
    ? membership.member_type === 'student'
      ? 'student'
      : 'member'
    : 'nonmember'
  const fee =
    rateType === 'member'
      ? Number(event.fee_member)
      : rateType === 'student'
        ? Number(event.fee_student || event.fee_member)
        : Number(event.fee_nonmember)

  return (
    <>
      <PageHeader title={pick(event, 'title', locale)}>
        <p className="mt-3 text-sm text-muted">
          {formatDateRange(event.starts_at, event.ends_at, locale)}
        </p>
        <Link
          href={lp(locale, `/events/${event.slug}`)}
          className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-crimson"
        >
          <ArrowLeft className="h-4 w-4" /> {d.common.back}
        </Link>
      </PageHeader>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {reg && reg.status !== 'cancelled' ? (
          <Card>
            <p className="flex items-center gap-2 font-semibold text-jade">
              <CheckCircle2 className="h-5 w-5" /> {d.events.registered}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={reg.status === 'confirmed' ? 'jade' : 'gold'}>{d.status[reg.status]}</Badge>
              <Badge tone={reg.payment_status === 'paid' ? 'jade' : 'neutral'}>
                {d.status[reg.payment_status as keyof typeof d.status] ?? reg.payment_status}
              </Badge>
            </div>
            <div className="mt-5">
              <ButtonLink href={lp(locale, '/me')} variant="outline">
                {d.nav.me}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <>
            <div className="mb-8 rounded-xl border border-line bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                {d.register.yourRate}
              </p>
              <p className="mt-1.5 text-xl font-bold text-crimson">
                {fee === 0 ? d.common.free : formatMoney(fee, locale)}
              </p>
              <p className="mt-1 text-sm text-muted">
                {rateType === 'nonmember' ? d.events.feeNonmember : rateType === 'student' ? d.events.feeStudent : d.events.feeMember}
                {' · '}
                {rateType === 'nonmember' ? d.register.rateNonmemberNote : d.register.rateMemberNote}
              </p>
            </div>
            <RegisterForm
              locale={locale}
              slug={event.slug}
              userId={session.userId}
              email={session.email}
              profile={session.profile}
              fee={fee}
              rateType={rateType}
              bank={bank}
            />
          </>
        )}
      </div>
    </>
  )
}
