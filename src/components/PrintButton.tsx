'use client'

import { Printer } from 'lucide-react'

export default function PrintButton({ label }: { label: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg border border-crimson px-4 py-2.5 text-sm font-semibold text-crimson hover:bg-crimson-soft"
    >
      <Printer className="h-4 w-4" /> {label}
    </button>
  )
}
