import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { PageHeader, Card, ButtonLink, Badge } from '@/components/ui'
import JoinForm from '@/components/JoinForm'
import LoginButton from '@/components/LoginButton'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/format'
import type { Membership } from '@/lib/types'

export default async function JoinPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const { membership_fees, bank } = await getSettings()
  const session = await getSession()

  let latest: Membership | null = null
  if (session) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', session.userId)
      .order('created_at', { ascending: false })
      .limit(1)
    latest = (data?.[0] as Membership) ?? null
  }

  const active =
    latest?.status === 'active' &&
    (!latest.end_date || new Date(latest.end_date) >= new Date(new Date().toDateString()))

  return (
    <>
      <PageHeader title={d.join.title} lead={d.join.lead} />

      <div className="mx-auto max-w-3xl px-4 py-10">
        {!session ? (
          <Card className="text-center">
            <p className="text-sm text-muted">{d.join.loginFirst}</p>
            <div className="mx-auto max-w-xs">
              <LoginButton locale={locale} next={lp(locale, '/join')} label={d.login.google} />
            </div>
          </Card>
        ) : latest?.status === 'pending' ? (
          <Card>
            <p className="flex items-center gap-2 font-semibold text-gold">
              <Clock className="h-5 w-5" /> {d.join.alreadyPending}
            </p>
            <p className="mt-2 text-sm text-muted">{d.join.submittedBody}</p>
            <div className="mt-5">
              <ButtonLink href={lp(locale, '/me')} variant="outline">
                {d.nav.me}
              </ButtonLink>
            </div>
          </Card>
        ) : active ? (
          <Card>
            <p className="flex items-center gap-2 font-semibold text-jade">
              <CheckCircle2 className="h-5 w-5" /> {d.join.alreadyMember}
            </p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{d.me.memberCode}</dt>
                <dd className="font-mono font-semibold">{session.profile?.member_code ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{d.join.memberType}</dt>
                <dd>{d.join.types[latest!.member_type]}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{d.me.validUntil}</dt>
                <dd>{latest!.end_date ? formatDate(latest!.end_date, locale) : '—'}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink href={lp(locale, '/me')} variant="outline">
                {d.nav.me}
              </ButtonLink>
              <ButtonLink href={lp(locale, '/members')} variant="ghost">
                {d.nav.members}
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <>
            {latest?.status === 'rejected' && (
              <div className="mb-6 flex gap-3 rounded-xl border border-crimson/30 bg-crimson-soft p-4 text-sm">
                <AlertCircle className="h-5 w-5 shrink-0 text-crimson" />
                <div>
                  <p className="font-semibold text-crimson">{d.status.rejected}</p>
                  {latest.review_note && <p className="mt-1 text-muted">{latest.review_note}</p>}
                </div>
              </div>
            )}
            {latest?.status === 'expired' && (
              <div className="mb-6">
                <Badge tone="gold">{d.status.expired}</Badge>
              </div>
            )}
            <JoinForm
              locale={locale}
              userId={session.userId}
              profile={session.profile}
              fees={membership_fees}
              bank={bank}
              renew={latest?.status === 'expired'}
            />
          </>
        )}
      </div>
    </>
  )
}
