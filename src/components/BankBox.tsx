import { Landmark } from 'lucide-react'
import { getDict, type Locale } from '@/lib/i18n'
import { formatMoney } from '@/lib/format'
import type { BankInfo } from '@/lib/types'

export default function BankBox({
  bank,
  amount,
  locale,
}: {
  bank: BankInfo
  amount: number
  locale: Locale
}) {
  const d = getDict(locale)
  return (
    <div className="rounded-xl border border-gold/40 bg-gold-soft p-5">
      <p className="flex items-center gap-2 text-sm font-semibold text-crimson-dark">
        <Landmark className="h-4 w-4" /> {d.register.transferTo}
      </p>
      <dl className="mt-3 space-y-1.5 text-sm">
        {bank.bank_name && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{locale === 'th' ? 'ธนาคาร' : 'Bank'}</dt>
            <dd className="font-medium">{bank.bank_name}</dd>
          </div>
        )}
        {bank.account_name && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{locale === 'th' ? 'ชื่อบัญชี' : 'Account name'}</dt>
            <dd className="text-right font-medium">{bank.account_name}</dd>
          </div>
        )}
        {bank.account_no && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">{locale === 'th' ? 'เลขที่บัญชี' : 'Account no.'}</dt>
            <dd className="font-mono font-medium">{bank.account_no}</dd>
          </div>
        )}
        {bank.promptpay && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted">PromptPay</dt>
            <dd className="font-mono font-medium">{bank.promptpay}</dd>
          </div>
        )}
        <div className="mt-2 flex justify-between gap-4 border-t border-gold/30 pt-2">
          <dt className="font-semibold">{locale === 'th' ? 'ยอดที่ต้องโอน' : 'Amount due'}</dt>
          <dd className="text-base font-bold text-crimson">{formatMoney(amount, locale)}</dd>
        </div>
      </dl>
    </div>
  )
}
