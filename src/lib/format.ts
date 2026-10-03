import type { Locale } from './i18n'

const tz = 'Asia/Bangkok'

export function formatDate(iso: string | null | undefined, locale: Locale, withTime = false) {
  if (!iso) return '—'
  const d = new Date(iso)
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    dateStyle: 'long',
    ...(withTime ? { timeStyle: 'short' as const } : {}),
    timeZone: tz,
  }).format(d)
}

export function formatTime(iso: string | null | undefined, locale: Locale) {
  if (!iso) return ''
  return new Intl.DateTimeFormat(locale === 'th' ? 'th-TH' : 'en-GB', {
    timeStyle: 'short',
    timeZone: tz,
  }).format(new Date(iso))
}

/** ช่วงวันของงาน เช่น "12 – 13 ก.ค. 2569" หรือวันเดียวพร้อมเวลา */
export function formatDateRange(startIso: string, endIso: string | null, locale: Locale) {
  const start = new Date(startIso)
  const end = endIso ? new Date(endIso) : null
  const sameDay =
    end &&
    new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(start) ===
      new Intl.DateTimeFormat('en-CA', { timeZone: tz }).format(end)

  if (!end) return `${formatDate(startIso, locale)} · ${formatTime(startIso, locale)}`
  if (sameDay)
    return `${formatDate(startIso, locale)} · ${formatTime(startIso, locale)}–${formatTime(endIso, locale)}`
  return `${formatDate(startIso, locale)} – ${formatDate(endIso, locale)}`
}

export function formatMoney(amount: number | null | undefined, locale: Locale) {
  const n = Number(amount ?? 0)
  const value = new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US', {
    maximumFractionDigits: n % 1 === 0 ? 0 : 2,
  }).format(n)
  return locale === 'th' ? `${value} บาท` : `${value} THB`
}

/** แปลงชื่อเป็น slug ใช้ใน URL (รองรับไทย) */
export function slugify(input: string) {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || `post-${Date.now().toString(36)}`
  )
}

export function isUpcoming(event: { starts_at: string; ends_at: string | null }) {
  const ref = event.ends_at ?? event.starts_at
  return new Date(ref).getTime() >= Date.now() - 6 * 60 * 60 * 1000
}

/**
 * ค่าจาก <input type="datetime-local"> เป็นเวลาไทยเสมอ (ผู้ใช้กรอกตามเวลาไทย)
 * แต่ server action รันบน Vercel ที่ TZ=UTC — ถ้าปล่อยให้ new Date() เดาจะเพี้ยนไป 7 ชั่วโมง
 */
export function bangkokToIso(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  if (/[zZ]|[+-]\d{2}:\d{2}$/.test(v)) return new Date(v).toISOString()
  const withSeconds = /T\d{2}:\d{2}$/.test(v) ? `${v}:00` : v
  const d = new Date(`${withSeconds}+07:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** UTC ISO → ค่าที่ใส่ใน <input type="datetime-local"> เป็นเวลาไทย */
export function isoToBangkokInput(iso: string | null | undefined) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return new Date(d.getTime() + 7 * 3600 * 1000).toISOString().slice(0, 16)
}
