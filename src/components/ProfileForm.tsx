'use client'

import { useState } from 'react'
import { Field, inputClass } from './ui'
import { updateProfile } from '@/lib/actions/profile'
import { getDict, type Locale } from '@/lib/i18n'
import type { Profile } from '@/lib/types'

export default function ProfileForm({ locale, profile }: { locale: Locale; profile: Profile | null }) {
  const d = getDict(locale)
  const [saving, setSaving] = useState(false)

  return (
    <form action={updateProfile} onSubmit={() => setSaving(true)} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={d.common.name} required>
          <input name="full_name" required defaultValue={profile?.full_name ?? ''} className={inputClass} />
        </Field>
        <Field label={locale === 'th' ? 'ชื่อ-นามสกุล (อังกฤษ)' : 'Full name (English)'}>
          <input name="full_name_en" defaultValue={profile?.full_name_en ?? ''} className={inputClass} />
        </Field>
        <Field label={d.common.phone}>
          <input name="phone" defaultValue={profile?.phone ?? ''} className={inputClass} />
        </Field>
        <Field label="LINE ID">
          <input name="line_id" defaultValue={profile?.line_id ?? ''} className={inputClass} />
        </Field>
        <Field label={d.register.licenseNo}>
          <input name="license_no" defaultValue={profile?.license_no ?? ''} className={inputClass} />
        </Field>
        <Field label={d.register.workplace}>
          <input name="workplace" defaultValue={profile?.workplace ?? ''} className={inputClass} />
        </Field>
        <Field label={locale === 'th' ? 'ตำแหน่ง' : 'Position'}>
          <input name="job_title" defaultValue={profile?.job_title ?? ''} className={inputClass} />
        </Field>
        <Field label={locale === 'th' ? 'จังหวัด' : 'Province'}>
          <input name="province" defaultValue={profile?.province ?? ''} className={inputClass} />
        </Field>
      </div>
      <Field label={locale === 'th' ? 'แนะนำตัว / ความสนใจทางคลินิก' : 'Bio / clinical interests'}>
        <textarea name="bio" rows={3} defaultValue={profile?.bio ?? ''} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2.5 text-sm">
        <input
          type="checkbox"
          name="show_in_directory"
          defaultChecked={profile?.show_in_directory ?? true}
          className="h-4 w-4 accent-[var(--crimson)]"
        />
        {d.me.showInDirectory}
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-crimson px-5 py-2.5 text-sm font-semibold text-white hover:bg-crimson-dark disabled:opacity-60"
      >
        {saving ? d.common.saving : d.common.save}
      </button>
    </form>
  )
}
