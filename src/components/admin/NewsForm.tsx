'use client'

import { useState } from 'react'
import { Field, inputClass } from '../ui'
import MediaUpload from '../MediaUpload'
import { saveNews, deleteNews } from '@/lib/actions/admin'
import { getDict, type Locale } from '@/lib/i18n'
import type { News } from '@/lib/types'
import { isoToBangkokInput } from '@/lib/format'

export default function NewsForm({ locale, item }: { locale: Locale; item?: News | null }) {
  const d = getDict(locale)
  const [saving, setSaving] = useState(false)

  return (
    <>
      <form action={saveNews} onSubmit={() => setSaving(true)} className="space-y-5">
        <input type="hidden" name="locale" value={locale} />
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="หัวข้อ (ไทย)" required>
            <input name="title_th" required defaultValue={item?.title_th ?? ''} className={inputClass} />
          </Field>
          <Field label="Title (English)">
            <input name="title_en" defaultValue={item?.title_en ?? ''} className={inputClass} />
          </Field>
          <Field label="หมวด">
            <select name="category" defaultValue={item?.category ?? 'news'} className={inputClass}>
              <option value="announcement">{d.news.categories.announcement}</option>
              <option value="news">{d.news.categories.news}</option>
              <option value="activity">{d.news.categories.activity}</option>
              <option value="knowledge">{d.news.categories.knowledge}</option>
            </select>
          </Field>
          <Field label="slug (URL)" hint="เว้นว่างได้ ระบบจะสร้างให้จากหัวข้อ">
            <input name="slug" defaultValue={item?.slug ?? ''} className={inputClass} />
          </Field>
        </div>

        <MediaUpload name="cover_url" label="รูปหน้าปก" defaultValue={item?.cover_url ?? ''} folder="news" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="เกริ่นนำ (ไทย)">
            <textarea name="excerpt_th" rows={2} defaultValue={item?.excerpt_th ?? ''} className={inputClass} />
          </Field>
          <Field label="Excerpt (English)">
            <textarea name="excerpt_en" rows={2} defaultValue={item?.excerpt_en ?? ''} className={inputClass} />
          </Field>
        </div>

        <Field label="เนื้อหา (ไทย)">
          <textarea name="body_th" rows={12} defaultValue={item?.body_th ?? ''} className={inputClass} />
        </Field>
        <Field label="Body (English)">
          <textarea name="body_en" rows={8} defaultValue={item?.body_en ?? ''} className={inputClass} />
        </Field>

        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_published"
              defaultChecked={item?.is_published ?? false}
              className="h-4 w-4 accent-[var(--crimson)]"
            />
            เผยแพร่
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_pinned"
              defaultChecked={item?.is_pinned ?? false}
              className="h-4 w-4 accent-[var(--crimson)]"
            />
            ปักหมุด
          </label>
          <input
            type="datetime-local"
            name="published_at"
            defaultValue={isoToBangkokInput(item?.published_at)}
            className="rounded-lg border border-line px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-crimson px-5 py-2.5 font-semibold text-white hover:bg-crimson-dark disabled:opacity-60"
        >
          {saving ? d.common.saving : d.common.save}
        </button>
      </form>

      {item && (
        <form action={deleteNews} className="mt-8 border-t border-line pt-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={item.id} />
          <button className="text-sm text-muted hover:text-crimson">{d.common.delete}</button>
        </form>
      )}
    </>
  )
}
