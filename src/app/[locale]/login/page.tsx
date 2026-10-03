import { isLocale, getDict, type Locale } from '@/lib/i18n'
import LoginButton from '@/components/LoginButton'
import Logo from '@/components/Logo'

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ next?: string; error?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { next, error } = await searchParams
  const d = getDict(locale)

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <Logo className="h-16 w-16" />
      <h1 className="mt-6 text-2xl font-bold text-crimson-dark">{d.login.title}</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{d.login.lead}</p>
      {error && (
        <p className="mt-4 w-full rounded-lg bg-crimson-soft px-4 py-3 text-sm text-crimson">
          {d.login.error}
        </p>
      )}
      <LoginButton locale={locale} next={next} label={d.login.google} />
    </div>
  )
}
