'use client'

import { Download } from 'lucide-react'

export default function ExportCsvButton({
  rows,
  filename,
  label,
}: {
  rows: Record<string, string | number | null>[]
  filename: string
  label: string
}) {
  const download = () => {
    if (rows.length === 0) return
    const headers = Object.keys(rows[0])
    const escape = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ].join('\n')
    // BOM เพื่อให้ Excel อ่านภาษาไทยถูก
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <button
      onClick={download}
      className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm hover:border-gold"
    >
      <Download className="h-4 w-4" /> {label}
    </button>
  )
}
