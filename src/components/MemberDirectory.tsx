'use client'

import { useMemo, useState } from 'react'
import { Search, MapPin, Building2 } from 'lucide-react'
import { getDict, type Locale } from '@/lib/i18n'
import type { Profile } from '@/lib/types'

export default function MemberDirectory({
  locale,
  members,
}: {
  locale: Locale
  members: Pick<
    Profile,
    'id' | 'full_name' | 'full_name_en' | 'avatar_url' | 'workplace' | 'province' | 'job_title' | 'member_code' | 'bio'
  >[]
}) {
  const d = getDict(locale)
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return members
    return members.filter((m) =>
      [m.full_name, m.full_name_en, m.workplace, m.province, m.member_code]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle))
    )
  }, [q, members])

  return (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={d.members.searchPlaceholder}
          className="w-full rounded-lg border border-line bg-surface py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold"
        />
      </div>
      <p className="mt-3 text-sm text-muted">{d.members.count.replace('{n}', String(filtered.length))}</p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {filtered.map((m) => (
          <div key={m.id} className="flex gap-3 rounded-xl border border-line bg-surface p-4">
            {m.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.avatar_url} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-crimson-soft text-sm font-bold text-crimson">
                {(m.full_name ?? '?').trim().charAt(0)}
              </div>
            )}
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                {locale === 'en' ? m.full_name_en || m.full_name : m.full_name}
              </p>
              {m.member_code && <p className="font-mono text-xs text-gold">{m.member_code}</p>}
              {m.workplace && (
                <p className="mt-1 flex items-center gap-1.5 text-muted">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{m.workplace}</span>
                </p>
              )}
              {m.province && (
                <p className="flex items-center gap-1.5 text-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {m.province}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
