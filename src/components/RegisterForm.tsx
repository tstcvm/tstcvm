'use client'

import { useState } from 'react'
import { Field, inputClass } from './ui'
import SlipUpload from './SlipUpload'
import BankBox from './BankBox'
import { registerForEvent } from '@/lib/actions/registration'
import { getDict, type Locale } from '@/lib/i18n'
import type { BankInfo, Profile, RateType } from '@/lib/types'

export default function RegisterForm({
  locale,
  slug,
  userId,
  email,
  profile,
  fee,
  rateType,
  bank,
}: {
  locale: Locale
  slug: string
  userId: string
  email: string | null
  profile: Profile | null
  fee: number
  rateType: RateType
  bank: BankInfo
}) {
  const d = getDict(locale)
  const [submitting, setSubmitting] = useState(false)

  return (
    <form action={registerForEvent} onSubmit={() => setSubmitting(true)} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="slug" value={slug} />

      <section>
        <h2 className="text-lg font-bold text-crimson-dark">{d.register.title}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={d.common.name} required>
            <input
              name="attendee_name"
              required
              defaultValue={profile?.full_name ?? ''}
              className={inputClass}
            />
          </Field>
          <Field label={d.common.email} required>
            <input
              type="email"
              name="attendee_email"
              required
              defaultValue={email ?? ''}
              className={inputClass}
            />
          </Field>
          <Field label={d.common.phone} required>
            <input name="attendee_phone" required defaultValue={profile?.phone ?? ''} className={inputClass} />
          </Field>
          <Field label={d.register.licenseNo}>
            <input
              name="attendee_license_no"
              defaultValue={profile?.license_no ?? ''}
              className={inputClass}
            />
          </Field>
          <Field label={d.register.workplace}>
            <input
              name="attendee_workplace"
              defaultValue={profile?.workplace ?? ''}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      {fee > 0 && (
        <section>
          <h2 className="text-lg font-bold text-crimson-dark">{d.join.payment}</h2>
          <p className="mt-1 text-sm text-muted">
            {rateType === 'nonmember' ? d.register.rateNonmemberNote : d.register.rateMemberNote}
          </p>
          <div className="mt-4 grid gap-5 lg:grid-cols-2">
            <BankBox bank={bank} amount={fee} locale={locale} />
            <div className="space-y-4">
              <SlipUpload
                userId={userId}
                folder={`event-${slug}`}
                name="payment_slip_path"
                label={d.common.uploadSlip}
                required
              />
              <Field label={d.register.transferredAt}>
                <input type="datetime-local" name="transferred_at" className={inputClass} />
              </Field>
            </div>
          </div>
        </section>
      )}

      <Field label={d.register.note}>
        <textarea name="note" rows={3} className={inputClass} />
      </Field>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-crimson px-5 py-3 font-semibold text-white transition hover:bg-crimson-dark disabled:opacity-60 sm:w-auto"
      >
        {submitting ? d.common.saving : d.register.submit}
      </button>
    </form>
  )
}
