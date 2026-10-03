'use client'

import { useState } from 'react'
import { Field, inputClass } from './ui'
import SlipUpload from './SlipUpload'
import BankBox from './BankBox'
import { applyMembership } from '@/lib/actions/membership'
import { getDict, type Locale } from '@/lib/i18n'
import type { BankInfo, MemberType, MembershipFees, Profile } from '@/lib/types'

const TYPES: MemberType[] = ['regular', 'student', 'associate', 'lifetime']

export default function JoinForm({
  locale,
  userId,
  profile,
  fees,
  bank,
  renew,
}: {
  locale: Locale
  userId: string
  profile: Profile | null
  fees: MembershipFees
  bank: BankInfo
  renew?: boolean
}) {
  const d = getDict(locale)
  const [memberType, setMemberType] = useState<MemberType>('regular')
  const [submitting, setSubmitting] = useState(false)
  const fee = Number(fees?.[memberType] ?? 0)

  return (
    <form action={applyMembership} onSubmit={() => setSubmitting(true)} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />

      <section>
        <h2 className="text-lg font-bold text-crimson-dark">{d.join.memberType}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {TYPES.map((t) => (
            <label
              key={t}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                memberType === t ? 'border-crimson bg-crimson-soft' : 'border-line bg-surface hover:border-gold'
              }`}
            >
              <input
                type="radio"
                name="member_type"
                value={t}
                checked={memberType === t}
                onChange={() => setMemberType(t)}
                className="mt-1 accent-[var(--crimson)]"
              />
              <span className="text-sm">
                <span className="block font-semibold">{d.join.types[t]}</span>
                <span className="text-muted">
                  {Number(fees?.[t] ?? 0).toLocaleString()} {d.common.baht}{' '}
                  {t === 'lifetime' ? d.join.oneTime : d.join.perYear}
                </span>
              </span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-crimson-dark">{d.join.personal}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label={d.common.name} required>
            <input
              name="full_name"
              required
              defaultValue={profile?.full_name ?? ''}
              className={inputClass}
            />
          </Field>
          <Field label={locale === 'th' ? 'ชื่อ-นามสกุล (อังกฤษ)' : 'Full name (English)'}>
            <input name="full_name_en" defaultValue={profile?.full_name_en ?? ''} className={inputClass} />
          </Field>
          <Field label={d.common.phone} required>
            <input name="phone" required defaultValue={profile?.phone ?? ''} className={inputClass} />
          </Field>
          <Field label="LINE ID">
            <input name="line_id" defaultValue={profile?.line_id ?? ''} className={inputClass} />
          </Field>
          <Field label={locale === 'th' ? 'จังหวัด' : 'Province'}>
            <input name="province" defaultValue={profile?.province ?? ''} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-crimson-dark">{d.join.professional}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label={d.register.licenseNo}
            hint={locale === 'th' ? 'เช่น ว. 1234 — เว้นว่างได้ถ้าเป็นนักศึกษา' : 'Leave blank if student'}
          >
            <input name="license_no" defaultValue={profile?.license_no ?? ''} className={inputClass} />
          </Field>
          <Field label={d.register.workplace}>
            <input name="workplace" defaultValue={profile?.workplace ?? ''} className={inputClass} />
          </Field>
          <Field label={locale === 'th' ? 'ตำแหน่ง' : 'Position'}>
            <input name="job_title" defaultValue={profile?.job_title ?? ''} className={inputClass} />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-crimson-dark">{d.join.payment}</h2>
        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <BankBox bank={bank} amount={fee} locale={locale} />
          <div className="space-y-4">
            <SlipUpload
              userId={userId}
              folder="membership"
              name="payment_slip_path"
              label={d.common.uploadSlip}
              required
            />
            <Field label={d.register.transferredAt}>
              <input type="datetime-local" name="transferred_at" className={inputClass} />
            </Field>
            <Field label={d.join.paymentRef}>
              <input name="payment_ref" className={inputClass} />
            </Field>
          </div>
        </div>
        <div className="mt-4">
          <Field label={d.join.note}>
            <textarea name="applicant_note" rows={3} className={inputClass} />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-crimson px-5 py-3 font-semibold text-white transition hover:bg-crimson-dark disabled:opacity-60 sm:w-auto"
      >
        {submitting ? d.common.saving : renew ? d.join.renew : d.join.submit}
      </button>
    </form>
  )
}
