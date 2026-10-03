import { PageHeader, Card } from '@/components/ui'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'
import { Mail, Phone, MapPin, Link2 } from 'lucide-react'

export const revalidate = 600

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const d = getDict(locale)
  const { society } = await getSettings()

  return (
    <>
      <PageHeader title={d.about.title} lead={d.site.tagline} />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <p className="text-lg font-semibold text-crimson-dark">{d.site.name}</p>
        <p className="text-sm text-gold">{d.site.fullEn}</p>

        <h2 className="mt-10 text-lg font-bold text-crimson-dark">{d.about.missionTitle}</h2>
        <div className="rule-gold mt-3 h-0.5 w-20 rounded-full" />
        <ol className="mt-5 space-y-3">
          {d.about.missions.map((m, i) => (
            <li key={i} className="flex gap-3 rounded-lg border border-line bg-surface p-4 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-crimson-soft text-xs font-bold text-crimson">
                {i + 1}
              </span>
              {m}
            </li>
          ))}
        </ol>

        <h2 className="mt-12 text-lg font-bold text-crimson-dark">{d.about.contact}</h2>
        <div className="rule-gold mt-3 h-0.5 w-20 rounded-full" />
        <Card className="mt-5">
          <ul className="space-y-3 text-sm">
            {society.email && (
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold" />
                <a href={`mailto:${society.email}`} className="hover:text-crimson">{society.email}</a>
              </li>
            )}
            {society.phone && (
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold" /> {society.phone}
              </li>
            )}
            {society.facebook && (
              <li className="flex items-center gap-3">
                <Link2 className="h-4 w-4 text-gold" />
                <a href={society.facebook} target="_blank" rel="noreferrer" className="hover:text-crimson">
                  Facebook
                </a>
              </li>
            )}
            {society.address && (
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gold" />
                <span className="leading-relaxed">{society.address}</span>
              </li>
            )}
          </ul>
        </Card>
      </div>
    </>
  )
}
