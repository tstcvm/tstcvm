import Link from 'next/link'
import { LayoutDashboard, Newspaper, CalendarDays, Users, UserCog, Settings } from 'lucide-react'
import { getDict, isLocale, lp, type Locale } from '@/lib/i18n'
import { requireAdmin } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const session = await requireAdmin(locale)

  const items = [
    { href: '/admin', label: d.admin.dashboard, Icon: LayoutDashboard },
    { href: '/admin/members', label: d.admin.members, Icon: Users },
    { href: '/admin/events', label: d.admin.events, Icon: CalendarDays },
    { href: '/admin/news', label: d.admin.news, Icon: Newspaper },
    { href: '/admin/settings', label: d.admin.settings, Icon: Settings },
    ...(session.profile?.role === 'superadmin'
      ? [{ href: '/admin/users', label: d.admin.users, Icon: UserCog }]
      : []),
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-bold text-crimson-dark">{d.admin.title}</h1>
        <span className="rounded-full bg-crimson-soft px-2.5 py-0.5 text-xs font-semibold text-crimson">
          {session.profile?.role}
        </span>
      </div>

      <nav className="mt-5 flex gap-1 overflow-x-auto border-b border-line pb-px">
        {items.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={lp(locale, href)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-t-lg px-3.5 py-2.5 text-sm text-ink/80 hover:bg-crimson-soft/60"
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
      </nav>

      <div className="py-8">{children}</div>
    </div>
  )
}
