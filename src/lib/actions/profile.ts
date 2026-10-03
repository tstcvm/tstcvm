'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { lp, type Locale } from '@/lib/i18n'

export async function updateProfile(formData: FormData) {
  const locale = (formData.get('locale') as Locale) || 'th'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(lp(locale, '/login'))

  const patch = {
    full_name: String(formData.get('full_name') || '').trim() || null,
    full_name_en: String(formData.get('full_name_en') || '').trim() || null,
    phone: String(formData.get('phone') || '').trim() || null,
    license_no: String(formData.get('license_no') || '').trim() || null,
    workplace: String(formData.get('workplace') || '').trim() || null,
    job_title: String(formData.get('job_title') || '').trim() || null,
    province: String(formData.get('province') || '').trim() || null,
    line_id: String(formData.get('line_id') || '').trim() || null,
    bio: String(formData.get('bio') || '').trim() || null,
    show_in_directory: formData.get('show_in_directory') === 'on',
  }

  const { error } = await supabase.from('profiles').update(patch).eq('id', user.id)
  revalidatePath(lp(locale, '/me'))
  redirect(`${lp(locale, '/me')}?msg=${error ? 'error' : 'saved'}`)
}
