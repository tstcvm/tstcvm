import Link from 'next/link'
import Logo from './Logo'
import { getDict, lp, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'

export default async function SiteFooter({ locale }: { locale: Locale }) {
  const d = getDict(locale)
  const { society } = await getSettings()

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-9 w-9" />
            <span className="text-base font-bold text-crimson">TSTCVM</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{d.site.name}</p>
          <p className="text-xs text-muted">{d.site.fullEn}</p>
        </div>

        <div className="text-sm">
          <p className="mb-2 font-semibold">{d.nav.home}</p>
          <ul className="space-y-1.5 text-muted">
            <li><Link href={lp(locale, '/news')} className="hover:text-crimson">{d.nav.news}</Link></li>
            <li><Link href={lp(locale, '/events')} className="hover:text-crimson">{d.nav.events}</Link></li>
            <li><Link href={lp(locale, '/about')} className="hover:text-crimson">{d.nav.about}</Link></li>
            <li><Link href={lp(locale, '/join')} className="hover:text-crimson">{d.nav.join}</Link></li>
          </ul>
        </div>

        <div className="text-sm">
          <p className="mb-2 font-semibold">{d.about.contact}</p>
          <ul className="space-y-1.5 text-muted">
            {society.email && (
              <li>
                <a href={`mailto:${society.email}`} className="hover:text-crimson">{society.email}</a>
              </li>
            )}
            {society.phone && <li>{society.phone}</li>}
            {society.facebook && (
              <li>
                <a href={society.facebook} target="_blank" rel="noreferrer" className="hover:text-crimson">
                  Facebook
                </a>
              </li>
            )}
            {society.address && <li className="leading-relaxed">{society.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} TSTCVM — {d.site.name}
      </div>
    </footer>
  )
}
