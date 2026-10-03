'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSession, isAdmin } from '@/lib/auth'
import { lp, type Locale } from '@/lib/i18n'
import { slugify, bangkokToIso } from '@/lib/format'
import type { Role } from '@/lib/types'

async function adminClient(locale: Locale) {
  const session = await getSession()
  if (!session || !isAdmin(session.profile)) redirect(lp(locale, '/'))
  return { supabase: await createClient(), session: session! }
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? '').trim()
const num = (fd: FormData, key: string) => {
  const v = str(fd, key)
  return v === '' ? 0 : Number(v)
}
const nullableNum = (fd: FormData, key: string) => {
  const v = str(fd, key)
  return v === '' ? null : Number(v)
}
const ts = (fd: FormData, key: string) => bangkokToIso(str(fd, key))

/* ---------------------------------- สมาชิก --------------------------------- */

export async function approveMembership(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)
  const id = str(formData, 'id')
  const years = Number(str(formData, 'years') || 1)

  const { data: m } = await supabase.from('memberships').select('member_type').eq('id', id).single()
  const start = new Date()
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + years)

  await supabase
    .from('memberships')
    .update({
      status: 'active',
      start_date: start.toISOString().slice(0, 10),
      end_date: m?.member_type === 'lifetime' ? null : end.toISOString().slice(0, 10),
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
      review_note: str(formData, 'review_note') || null,
    })
    .eq('id', id)

  revalidatePath(lp(locale, '/admin/members'))
  redirect(`${lp(locale, '/admin/members')}?msg=approved`)
}

export async function rejectMembership(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)

  await supabase
    .from('memberships')
    .update({
      status: 'rejected',
      reviewed_by: session.userId,
      reviewed_at: new Date().toISOString(),
      review_note: str(formData, 'review_note') || null,
    })
    .eq('id', str(formData, 'id'))

  revalidatePath(lp(locale, '/admin/members'))
  redirect(`${lp(locale, '/admin/members')}?msg=rejected`)
}

/* ------------------------------- ผู้ใช้/สิทธิ์ ------------------------------- */

export async function setUserRole(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const session = await getSession()
  if (!session || session.profile?.role !== 'superadmin') redirect(lp(locale, '/admin'))
  const supabase = await createClient()

  const role = str(formData, 'role') as Role
  if (!['user', 'admin', 'superadmin'].includes(role)) redirect(lp(locale, '/admin/users'))

  const target = str(formData, 'user_id')
  // กันลดสิทธิ์ตัวเองโดยไม่ตั้งใจ
  if (target === session.userId) redirect(`${lp(locale, '/admin/users')}?msg=self`)

  const { error } = await supabase.from('profiles').update({ role }).eq('id', target)
  revalidatePath(lp(locale, '/admin/users'))
  redirect(`${lp(locale, '/admin/users')}?msg=${error ? 'error' : 'role'}`)
}

/* ---------------------------------- ข่าวสาร -------------------------------- */

export async function saveNews(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)
  const id = str(formData, 'id')
  const titleTh = str(formData, 'title_th')
  const publish = formData.get('is_published') === 'on'

  const row = {
    slug: str(formData, 'slug') || slugify(titleTh),
    category: str(formData, 'category') || 'news',
    title_th: titleTh,
    title_en: str(formData, 'title_en') || null,
    excerpt_th: str(formData, 'excerpt_th') || null,
    excerpt_en: str(formData, 'excerpt_en') || null,
    body_th: str(formData, 'body_th') || null,
    body_en: str(formData, 'body_en') || null,
    cover_url: str(formData, 'cover_url') || null,
    is_published: publish,
    is_pinned: formData.get('is_pinned') === 'on',
    published_at: publish ? ts(formData, 'published_at') || new Date().toISOString() : null,
    author_id: session.userId,
  }

  const { error } = id
    ? await supabase.from('news').update(row).eq('id', id)
    : await supabase.from('news').insert(row)

  if (error) redirect(`${lp(locale, '/admin/news')}?msg=error&detail=${encodeURIComponent(error.message)}`)
  revalidatePath(lp(locale, '/news'))
  revalidatePath(lp(locale, '/admin/news'))
  redirect(`${lp(locale, '/admin/news')}?msg=saved`)
}

export async function deleteNews(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase } = await adminClient(locale)
  await supabase.from('news').delete().eq('id', str(formData, 'id'))
  revalidatePath(lp(locale, '/news'))
  redirect(`${lp(locale, '/admin/news')}?msg=deleted`)
}

/* -------------------------------- งานสัมมนา -------------------------------- */

export async function saveEvent(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)
  const id = str(formData, 'id')
  const titleTh = str(formData, 'title_th')

  let agenda: unknown = []
  let speakers: unknown = []
  try {
    agenda = JSON.parse(str(formData, 'agenda') || '[]')
  } catch {
    agenda = []
  }
  try {
    speakers = JSON.parse(str(formData, 'speakers') || '[]')
  } catch {
    speakers = []
  }

  const row = {
    slug: str(formData, 'slug') || slugify(titleTh),
    title_th: titleTh,
    title_en: str(formData, 'title_en') || null,
    summary_th: str(formData, 'summary_th') || null,
    summary_en: str(formData, 'summary_en') || null,
    description_th: str(formData, 'description_th') || null,
    description_en: str(formData, 'description_en') || null,
    cover_url: str(formData, 'cover_url') || null,
    venue_th: str(formData, 'venue_th') || null,
    venue_en: str(formData, 'venue_en') || null,
    is_online: formData.get('is_online') === 'on',
    online_url: str(formData, 'online_url') || null,
    starts_at: ts(formData, 'starts_at') ?? new Date().toISOString(),
    ends_at: ts(formData, 'ends_at'),
    register_opens_at: ts(formData, 'register_opens_at'),
    register_closes_at: ts(formData, 'register_closes_at'),
    capacity: nullableNum(formData, 'capacity'),
    fee_member: num(formData, 'fee_member'),
    fee_nonmember: num(formData, 'fee_nonmember'),
    fee_student: num(formData, 'fee_student'),
    ce_credits: num(formData, 'ce_credits'),
    has_certificate: formData.get('has_certificate') === 'on',
    status: str(formData, 'status') || 'draft',
    agenda,
    speakers,
    created_by: session.userId,
  }

  const { error } = id
    ? await supabase.from('events').update(row).eq('id', id)
    : await supabase.from('events').insert(row)

  if (error) redirect(`${lp(locale, '/admin/events')}?msg=error&detail=${encodeURIComponent(error.message)}`)
  revalidatePath(lp(locale, '/events'))
  revalidatePath(lp(locale, '/admin/events'))
  redirect(`${lp(locale, '/admin/events')}?msg=saved`)
}

export async function deleteEvent(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase } = await adminClient(locale)
  await supabase.from('events').delete().eq('id', str(formData, 'id'))
  revalidatePath(lp(locale, '/events'))
  redirect(`${lp(locale, '/admin/events')}?msg=deleted`)
}

/* ------------------------------ ผู้ลงทะเบียน ------------------------------ */

export async function setPaymentStatus(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase } = await adminClient(locale)
  const status = str(formData, 'payment_status')
  const id = str(formData, 'id')

  await supabase
    .from('event_registrations')
    .update({
      payment_status: status,
      ...(status === 'paid' || status === 'waived' ? { status: 'confirmed' } : {}),
    })
    .eq('id', id)

  revalidatePath(str(formData, 'back') || lp(locale, '/admin/events'))
  redirect(`${str(formData, 'back') || lp(locale, '/admin/events')}?msg=paid`)
}

export async function toggleCheckIn(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)
  const id = str(formData, 'id')
  const checked = formData.get('checked') === '1'

  await supabase
    .from('event_registrations')
    .update(
      checked
        ? { checked_in_at: null, checked_in_by: null }
        : { checked_in_at: new Date().toISOString(), checked_in_by: session.userId, status: 'confirmed' }
    )
    .eq('id', id)

  const back = str(formData, 'back') || lp(locale, '/admin/events')
  revalidatePath(back)
  redirect(back)
}

/** ออกใบรับรองให้ทุกคนที่เช็กชื่อแล้วและยังไม่มีใบรับรอง */
export async function issueCertificates(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase } = await adminClient(locale)
  const eventId = str(formData, 'event_id')

  const { data: rows } = await supabase
    .from('event_registrations')
    .select('id')
    .eq('event_id', eventId)
    .not('checked_in_at', 'is', null)
    .is('certificate_code', null)

  const now = new Date().toISOString()
  const year = new Date().getFullYear()
  for (const r of rows ?? []) {
    const code = `TSTCVM-${year}-${crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase()}`
    await supabase
      .from('event_registrations')
      .update({ certificate_code: code, certificate_issued_at: now })
      .eq('id', r.id)
  }

  const back = str(formData, 'back') || lp(locale, '/admin/events')
  revalidatePath(back)
  redirect(`${back}?msg=certified&n=${rows?.length ?? 0}`)
}

/* --------------------------------- ตั้งค่า -------------------------------- */

export async function saveSettings(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const { supabase, session } = await adminClient(locale)

  const fees = {
    regular: num(formData, 'fee_regular'),
    student: num(formData, 'fee_student'),
    associate: num(formData, 'fee_associate'),
    lifetime: num(formData, 'fee_lifetime'),
    honorary: 0,
  }
  const bank = {
    bank_name: str(formData, 'bank_name'),
    account_name: str(formData, 'account_name'),
    account_no: str(formData, 'account_no'),
    promptpay: str(formData, 'promptpay'),
  }
  const society = {
    email: str(formData, 'society_email'),
    phone: str(formData, 'society_phone'),
    facebook: str(formData, 'society_facebook'),
    line: str(formData, 'society_line'),
    address: str(formData, 'society_address'),
  }

  const stamp = { updated_at: new Date().toISOString(), updated_by: session.userId }
  const { error } = await supabase.from('settings').upsert([
    { key: 'membership_fees', value: fees, ...stamp },
    { key: 'bank', value: bank, ...stamp },
    { key: 'society', value: society, ...stamp },
  ])

  revalidatePath(lp(locale, '/'))
  revalidatePath(lp(locale, '/admin/settings'))
  redirect(`${lp(locale, '/admin/settings')}?msg=${error ? 'error' : 'saved'}`)
}
