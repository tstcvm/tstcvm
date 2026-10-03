'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'

/** อัปโหลดรูปขึ้น bucket `media` (public) แล้วเก็บ URL ลงฟิลด์ของฟอร์ม */
export default function MediaUpload({
  name,
  label,
  defaultValue = '',
  folder = 'covers',
}: {
  name: string
  label: string
  defaultValue?: string
  folder?: string
}) {
  const [url, setUrl] = useState(defaultValue)
  const [busy, setBusy] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const onPick = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
    const { error } = await supabase.storage.from('media').upload(key, file, { upsert: false })
    setBusy(false)
    if (error) {
      toast.error(error.message)
      return
    }
    const { data } = supabase.storage.from('media').getPublicUrl(key)
    setUrl(data.publicUrl)
    toast.success('อัปโหลดรูปแล้ว')
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input type="hidden" name={name} value={url} />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />
      {url ? (
        <div className="relative inline-block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-32 w-56 rounded-lg border border-line object-cover" />
          <button
            type="button"
            onClick={() => setUrl('')}
            className="absolute -right-2 -top-2 rounded-full bg-crimson p-1 text-white"
            aria-label="remove"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex h-32 w-56 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-line bg-surface text-sm text-muted hover:border-gold"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {busy ? '…' : 'เลือกรูป'}
        </button>
      )}
    </div>
  )
}
