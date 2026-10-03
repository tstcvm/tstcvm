import type { Metadata } from 'next'
import { IBM_Plex_Sans_Thai } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import { isLocale, locales, type Locale } from '@/lib/i18n'
import { siteUrl } from '@/lib/queries'
import '../globals.css'

const plex = IBM_Plex_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const en = locale === 'en'

  const title = en
    ? 'TSTCVM — Thai Society of Traditional Chinese Veterinary Medicine'
    : 'TSTCVM — ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย'
  const description = en
    ? 'The Thai Society of Traditional Chinese Veterinary Medicine: news, membership, seminars and training in veterinary acupuncture and TCVM for Thai veterinarians.'
    : 'ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย — ข่าวสาร สมัครสมาชิก และลงทะเบียนงานสัมมนาด้านการฝังเข็มและการแพทย์แผนจีนในสัตว์สำหรับสัตวแพทย์ไทย'

  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: '%s · TSTCVM' },
    description,
    alternates: {
      canonical: en ? '/en' : '/',
      languages: { th: '/', en: '/en' },
    },
    openGraph: { title, description, type: 'website', locale: en ? 'en_US' : 'th_TH' },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'

  return (
    <html lang={locale} className={`${plex.className} h-full`}>
      <body className="flex min-h-full flex-col bg-paper text-ink">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
        <Toaster position="top-center" toastOptions={{ style: { fontSize: '0.9rem' } }} />
      </body>
    </html>
  )
}
