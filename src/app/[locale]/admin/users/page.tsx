import { redirect } from 'next/navigation'
import { Badge, EmptyState } from '@/components/ui'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { getSession } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { setUserRole } from '@/lib/actions/admin'
import { formatDate } from '@/lib/format'
import type { Profile } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ q?: string; msg?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { msg } = await searchParams
  const d = getDict(locale)

  const session = await getSession()
  if (session?.profile?.role !== 'superadmin') redirect(lp(locale, '/admin'))

  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('role', { ascending: true })
    .order('created_at', { ascending: false })
  const rows = (data ?? []) as Profile[]

  return (
    <>
      <p className="text-sm text-muted">
        {locale === 'th'
          ? 'superadmin เท่านั้นที่เปลี่ยนสิทธิ์ได้ — ตั้ง admin ให้กรรมการชมรมเพื่อช่วยดูแลข่าวสาร งานสัมมนา และอนุมัติสมาชิก'
          : 'Only a superadmin can change roles. Promote committee members to admin to help manage news, events and memberships.'}
      </p>
      {msg === 'self' && (
        <p className="mt-3 rounded-lg bg-crimson-soft px-4 py-2.5 text-sm text-crimson">
          {locale === 'th' ? 'เปลี่ยนสิทธิ์ของตัวเองไม่ได้' : 'You cannot change your own role'}
        </p>
      )}

      <div className="mt-6 space-y-2">
        {rows.length === 0 ? (
          <EmptyState>{d.common.none}</EmptyState>
        ) : (
          rows.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface p-4"
            >
              <div className="min-w-0">
                <p className="font-medium">{p.full_name ?? p.email}</p>
                <p className="text-xs text-muted">
                  {p.email} · {formatDate(p.created_at, locale)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {p.member_code && <Badge tone="gold">{p.member_code}</Badge>}
                <Badge tone={p.role === 'superadmin' ? 'crimson' : p.role === 'admin' ? 'jade' : 'neutral'}>
                  {p.role}
                </Badge>
                {p.id !== session.userId && (
                  <form action={setUserRole} className="flex items-center gap-2">
                    <input type="hidden" name="locale" value={locale} />
                    <input type="hidden" name="user_id" value={p.id} />
                    <select
                      name="role"
                      defaultValue={p.role}
                      className="rounded-lg border border-line px-2 py-1.5 text-sm"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                      <option value="superadmin">superadmin</option>
                    </select>
                    <button className="rounded-lg bg-crimson px-3 py-1.5 text-xs font-semibold text-white">
                      {d.common.save}
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
