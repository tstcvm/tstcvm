'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getSettings } from '@/lib/queries'
import { lp, type Locale } from '@/lib/i18n'
import { bangkokToIso } from '@/lib/format'
import type { MemberType } from '@/lib/types'

const MEMBER_TYPES: MemberType[] = ['regular', 'student', 'associate', 'honorary', 'lifetime']

export async function applyMembership(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(lp(locale, '/login'))

  const rawType = String(formData.get('member_type') || 'regular')
  const memberType = (MEMBER_TYPES.includes(rawType as MemberType) ? rawType : 'regular') as MemberType

  // ค่าสมาชิกคิดจากฝั่งเซิร์ฟเวอร์เท่านั้น
  const { membership_fees } = await getSettings()
  const fee = Number(membership_fees?.[memberType] ?? 0)

  // ยังมีใบสมัครค้างอยู่ไหม
  const { data: pending } = await supabase
    .from('memberships')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .maybeSingle()
  if (pending) redirect(`${lp(locale, '/me')}?msg=pending`)

  const profilePatch = {
    full_name: String(formData.get('full_name') || '').trim() || null,
    full_name_en: String(formData.get('full_name_en') || '').trim() || null,
    phone: String(formData.get('phone') || '').trim() || null,
    license_no: String(formData.get('license_no') || '').trim() || null,
    workplace: String(formData.get('workplace') || '').trim() || null,
    job_title: String(formData.get('job_title') || '').trim() || null,
    province: String(formData.get('province') || '').trim() || null,
    line_id: String(formData.get('line_id') || '').trim() || null,
  }
  await supabase.from('profiles').update(profilePatch).eq('id', user.id)

  const transferred = String(formData.get('transferred_at') || '')
  const { error } = await supabase.from('memberships').insert({
    user_id: user.id,
    member_type: memberType,
    status: 'pending',
    fee_amount: fee,
    payment_slip_path: String(formData.get('payment_slip_path') || '') || null,
    payment_ref: String(formData.get('payment_ref') || '').trim() || null,
    transferred_at: bangkokToIso(transferred),
    applicant_note: String(formData.get('applicant_note') || '').trim() || null,
  })
  if (error) redirect(`${lp(locale, '/join')}?error=${encodeURIComponent(error.message)}`)

  revalidatePath(lp(locale, '/me'))
  redirect(`${lp(locale, '/me')}?msg=applied`)
}
