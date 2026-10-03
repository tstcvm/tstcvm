'use client'

import { useRef, useState } from 'react'
import { Upload, Check, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

/** อัปโหลดสลิปขึ้น bucket `slips` ใต้โฟลเดอร์ของผู้ใช้เอง แล้วคืน path ให้ฟอร์ม */
export default function SlipUpload({
  userId,
  folder,
  name,
  label,
  required,
}: {
  userId: string
  folder: string
  name: string
  label: string
  required?: boolean
}) {
  const [path, setPath] = useState('')
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      toast.error('ไฟล์ใหญ่เกิน 8 MB')
      return
    }
    setBusy(true)
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const key = `${userId}/${folder}/${Date.now()}.${ext}`
    const { error } = await createClient().storage.from('slips').upload(key, file, {
      cacheControl: '3600',
      upsert: false,
    })
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    setPath(key)
    setFileName(file.name)
    toast.success('อัปโหลดสลิปแล้ว')
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">
        {label} {required && <span className="text-crimson">*</span>}
      </span>
      <input type="hidden" name={name} value={path} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className={`flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-4 py-6 text-sm transition ${
          path ? 'border-jade bg-jade-soft text-jade' : 'border-line bg-surface text-muted hover:border-gold'
        }`}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> กำลังอัปโหลด…
          </>
        ) : path ? (
          <>
            <Check className="h-4 w-4" /> {fileName}
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" /> เลือกรูปสลิป (JPG/PNG/PDF ไม่เกิน 8 MB)
          </>
        )}
      </button>
    </div>
  )
}
