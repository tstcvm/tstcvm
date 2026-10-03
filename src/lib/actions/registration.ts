'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getActiveMembership } from '@/lib/auth'
import { lp, type Locale } from '@/lib/i18n'
import { bangkokToIso } from '@/lib/format'
import type { RateType } from '@/lib/types'

export async function registerForEvent(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const slug = String(formData.get('slug') || '')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(lp(locale, '/login'))

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()
  if (!event || event.status !== 'published') redirect(lp(locale, '/events'))

  // อัตราค่าลงทะเบียนตัดสินที่เซิร์ฟเวอร์: สมาชิกที่ active ได้ราคาสมาชิก
  const membership = await getActiveMembership(user.id)
  const isStudent = membership?.member_type === 'student'
  const rateType: RateType = membership ? (isStudent ? 'student' : 'member') : 'nonmember'
  const fee =
    rateType === 'member'
      ? Number(event.fee_member)
      : rateType === 'student'
        ? Number(event.fee_student || event.fee_member)
        : Number(event.fee_nonmember)

  // ที่นั่งเต็ม → เข้าคิวรอ
  const { data: taken } = await supabase.rpc('event_seats_taken', { eid: event.id })
  const full = event.capacity ? Number(taken ?? 0) >= Number(event.capacity) : false

  const transferred = String(formData.get('transferred_at') || '')
  const slipPath = String(formData.get('payment_slip_path') || '') || null

  const { error } = await supabase.from('event_registrations').upsert(
    {
      event_id: event.id,
      user_id: user.id,
      attendee_name: String(formData.get('attendee_name') || '').trim(),
      attendee_email: String(formData.get('attendee_email') || '').trim() || user.email,
      attendee_phone: String(formData.get('attendee_phone') || '').trim() || null,
      attendee_license_no: String(formData.get('attendee_license_no') || '').trim() || null,
      attendee_workplace: String(formData.get('attendee_workplace') || '').trim() || null,
      rate_type: rateType,
      fee_amount: fee,
      payment_slip_path: slipPath,
      transferred_at: bangkokToIso(transferred),
      payment_status: fee === 0 ? 'waived' : slipPath ? 'pending' : 'unpaid',
      status: full ? 'waitlist' : fee === 0 ? 'confirmed' : 'pending',
      note: String(formData.get('note') || '').trim() || null,
    },
    { onConflict: 'event_id,user_id' }
  )

  if (error) redirect(`${lp(locale, `/events/${slug}/register`)}?error=${encodeURIComponent(error.message)}`)

  revalidatePath(lp(locale, '/me'))
  redirect(`${lp(locale, '/me')}?msg=registered`)
}

export async function cancelRegistration(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const id = String(formData.get('id') || '')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(lp(locale, '/login'))

  await supabase
    .from('event_registrations')
    .update({ status: 'cancelled' })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath(lp(locale, '/me'))
  redirect(`${lp(locale, '/me')}?msg=cancelled`)
}
