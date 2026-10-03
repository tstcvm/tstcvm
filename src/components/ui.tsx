import Link from 'next/link'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string
  lead?: string
  children?: ReactNode
}) {
  return (
    <div className="border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-bold text-crimson-dark sm:text-3xl">{title}</h1>
        <div className="rule-gold mt-3 h-0.5 w-24 rounded-full" />
        {lead && <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">{lead}</p>}
        {children}
      </div>
    </div>
  )
}

const tones = {
  neutral: 'bg-line/50 text-ink/70',
  crimson: 'bg-crimson-soft text-crimson',
  gold: 'bg-gold-soft text-gold',
  jade: 'bg-jade-soft text-jade',
} as const

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: keyof typeof tones
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-line bg-surface p-5 ${className}`}>{children}</div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface/60 px-6 py-12 text-center text-sm text-muted">
      {children}
    </div>
  )
}

export function ButtonLink({
  href,
  children,
  variant = 'primary',
  className = '',
}: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'outline' | 'ghost'
  className?: string
}) {
  const styles = {
    primary: 'bg-crimson text-white hover:bg-crimson-dark',
    outline: 'border border-crimson text-crimson hover:bg-crimson-soft',
    ghost: 'border border-line text-ink hover:border-gold',
  }[variant]
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${styles} ${className}`}
    >
      {children}
    </Link>
  )
}

/** input/label มาตรฐานของฟอร์ม */
export function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-crimson">*</span>}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20'
