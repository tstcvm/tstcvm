'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Menu, X, UserRound, ShieldCheck, LogOut } from 'lucide-react'
import Logo from './Logo'
import { createClient } from '@/lib/supabase/client'
import { getDict, lp, type Locale } from '@/lib/i18n'
import type { Profile } from '@/lib/types'

export default function SiteHeader({ locale }: { locale: Locale }) {
  const d = getDict(locale)
  const pathname = usePathname() || '/'
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    let alive = true

    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!alive) return
      if (!user) {
        setProfile(null)
        setReady(true)
        return
      }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      if (!alive) return
      setProfile((data as Profile) ?? null)
      setReady(true)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange(() => load())
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => setOpen(false), [pathname])

  const nav = [
    { href: '/news', label: d.nav.news },
    { href: '/events', label: d.nav.events },
    { href: '/about', label: d.nav.about },
    { href: '/join', label: d.nav.join },
  ]

  const isAdmin = profile?.role === 'admin' || profile?.role === 'superadmin'

  // path ปัจจุบันของอีกภาษาหนึ่ง
  const bare = pathname === '/en' ? '/' : pathname.startsWith('/en/') ? pathname.slice(3) : pathname
  const otherLocale: Locale = locale === 'th' ? 'en' : 'th'

  const active = (href: string) => bare === href || bare.startsWith(href + '/')

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = lp(locale, '/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href={lp(locale, '/')} className="flex items-center gap-2.5">
          <Logo className="h-9 w-9 shrink-0" />
          <span className="leading-tight">
            <span className="block text-base font-bold tracking-wide text-crimson">TSTCVM</span>
            <span className="hidden text-[11px] text-muted sm:block">{d.site.name}</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={lp(locale, item.href)}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active(item.href)
                  ? 'bg-crimson-soft font-semibold text-crimson'
                  : 'text-ink/80 hover:bg-crimson-soft/60'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            href={lp(otherLocale, bare)}
            className="hidden rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-muted hover:border-gold hover:text-crimson sm:block"
            aria-label="Switch language"
          >
            {locale === 'th' ? 'EN' : 'ไทย'}
          </Link>

          {ready && profile && (
            <>
              {isAdmin && (
                <Link
                  href={lp(locale, '/admin')}
                  className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-crimson-soft/60 md:flex"
                >
                  <ShieldCheck className="h-4 w-4" /> {d.nav.admin}
                </Link>
              )}
              <Link
                href={lp(locale, '/me')}
                className="hidden items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm hover:border-gold md:flex"
              >
                <UserRound className="h-4 w-4" />
                <span className="max-w-28 truncate">{profile.full_name ?? d.nav.me}</span>
              </Link>
              <button
                onClick={signOut}
                className="hidden rounded-lg p-2 text-muted hover:text-crimson md:block"
                aria-label={d.nav.logout}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
          {ready && !profile && (
            <Link
              href={lp(locale, '/login')}
              className="hidden rounded-lg bg-crimson px-3.5 py-2 text-sm font-semibold text-white hover:bg-crimson-dark md:block"
            >
              {d.nav.login}
            </Link>
          )}

          <button
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-2 text-ink md:hidden"
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-surface md:hidden">
          <div className="mx-auto max-w-6xl px-4 py-3">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={lp(locale, item.href)}
                className={`block rounded-lg px-3 py-2.5 ${
                  active(item.href) ? 'bg-crimson-soft font-semibold text-crimson' : ''
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="my-2 h-px bg-line" />
            {profile ? (
              <>
                <Link href={lp(locale, '/me')} className="block rounded-lg px-3 py-2.5">
                  {d.nav.me}
                </Link>
                {isAdmin && (
                  <Link href={lp(locale, '/admin')} className="block rounded-lg px-3 py-2.5">
                    {d.nav.admin}
                  </Link>
                )}
                <button onClick={signOut} className="block w-full px-3 py-2.5 text-left text-crimson">
                  {d.nav.logout}
                </button>
              </>
            ) : (
              <Link
                href={lp(locale, '/login')}
                className="block rounded-lg bg-crimson px-3 py-2.5 text-center font-semibold text-white"
              >
                {d.nav.login}
              </Link>
            )}
            <Link
              href={lp(otherLocale, bare)}
              className="mt-2 block rounded-lg border border-line px-3 py-2.5 text-center text-sm"
            >
              {locale === 'th' ? 'English' : 'ภาษาไทย'}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
