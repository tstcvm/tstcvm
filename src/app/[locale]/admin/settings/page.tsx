import { Field, inputClass } from '@/components/ui'
import { getDict, isLocale, type Locale } from '@/lib/i18n'
import { getSettings } from '@/lib/queries'
import { saveSettings } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ msg?: string }>
}) {
  const { locale: raw } = await params
  const locale: Locale = isLocale(raw) ? raw : 'th'
  const { msg } = await searchParams
  const d = getDict(locale)
  const { membership_fees, bank, society } = await getSettings()

  return (
    <form action={saveSettings} className="max-w-2xl space-y-8">
      <input type="hidden" name="locale" value={locale} />

      {msg === 'saved' && (
        <p className="rounded-lg bg-jade-soft px-4 py-2.5 text-sm text-jade">{d.me.profileSaved}</p>
      )}

      <fieldset className="rounded-xl border border-line bg-surface p-5">
        <legend className="px-2 text-sm font-semibold text-crimson-dark">
          {locale === 'th' ? 'ค่าสมาชิก (บาท)' : 'Membership fees (THB)'}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.join.types.regular}>
            <input type="number" name="fee_regular" min={0} defaultValue={membership_fees.regular ?? 0} className={inputClass} />
          </Field>
          <Field label={d.join.types.student}>
            <input type="number" name="fee_student" min={0} defaultValue={membership_fees.student ?? 0} className={inputClass} />
          </Field>
          <Field label={d.join.types.associate}>
            <input type="number" name="fee_associate" min={0} defaultValue={membership_fees.associate ?? 0} className={inputClass} />
          </Field>
          <Field label={d.join.types.lifetime}>
            <input type="number" name="fee_lifetime" min={0} defaultValue={membership_fees.lifetime ?? 0} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-line bg-surface p-5">
        <legend className="px-2 text-sm font-semibold text-crimson-dark">
          {locale === 'th' ? 'บัญชีรับเงิน' : 'Bank account'}
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={locale === 'th' ? 'ธนาคาร' : 'Bank'}>
            <input name="bank_name" defaultValue={bank.bank_name ?? ''} className={inputClass} />
          </Field>
          <Field label={locale === 'th' ? 'ชื่อบัญชี' : 'Account name'}>
            <input name="account_name" defaultValue={bank.account_name ?? ''} className={inputClass} />
          </Field>
          <Field label={locale === 'th' ? 'เลขที่บัญชี' : 'Account no.'}>
            <input name="account_no" defaultValue={bank.account_no ?? ''} className={inputClass} />
          </Field>
          <Field label="PromptPay">
            <input name="promptpay" defaultValue={bank.promptpay ?? ''} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-line bg-surface p-5">
        <legend className="px-2 text-sm font-semibold text-crimson-dark">{d.about.contact}</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={d.common.email}>
            <input name="society_email" defaultValue={society.email ?? ''} className={inputClass} />
          </Field>
          <Field label={d.common.phone}>
            <input name="society_phone" defaultValue={society.phone ?? ''} className={inputClass} />
          </Field>
          <Field label="Facebook URL">
            <input name="society_facebook" defaultValue={society.facebook ?? ''} className={inputClass} />
          </Field>
          <Field label="LINE">
            <input name="society_line" defaultValue={society.line ?? ''} className={inputClass} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label={locale === 'th' ? 'ที่อยู่' : 'Address'}>
            <textarea name="society_address" rows={2} defaultValue={society.address ?? ''} className={inputClass} />
          </Field>
        </div>
      </fieldset>

      <button className="rounded-lg bg-crimson px-5 py-2.5 font-semibold text-white hover:bg-crimson-dark">
        {d.common.save}
      </button>
    </form>
  )
}
