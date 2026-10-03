import { PageHeader, Card, ButtonLink } from '@/components/ui'
import MemberDirectory from '@/components/MemberDirectory'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { requireSession, getActiveMembership, isAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function MembersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const session = await requireSession(locale, '/members')
  const membership = await getActiveMembership(session.userId)

  if (!membership && !isAdmin(session.profile)) {
    return (
      <>
        <PageHeader title={d.members.title} lead={d.members.lead} />
        <div className="mx-auto max-w-2xl px-4 py-10">
          <Card className="text-center">
            <p className="text-sm text-muted">{d.members.memberOnly}</p>
            <div className="mt-5">
              <ButtonLink href={lp(locale, '/join')}>{d.me.applyNow}</ButtonLink>
            </div>
          </Card>
        </div>
      </>
    )
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, full_name_en, avatar_url, workplace, province, job_title, member_code, bio')
    .eq('show_in_directory', true)
    .not('member_code', 'is', null)
    .order('member_code', { ascending: true })

  return (
    <>
      <PageHeader title={d.members.title} lead={d.members.lead} />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <MemberDirectory locale={locale} members={data ?? []} />
      </div>
    </>
  )
}
