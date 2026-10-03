'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Field, inputClass } from '../ui'
import MediaUpload from '../MediaUpload'
import { saveEvent, deleteEvent } from '@/lib/actions/admin'
import { getDict, type Locale } from '@/lib/i18n'
import type { AgendaItem, EventRow, Speaker } from '@/lib/types'
import { isoToBangkokInput as toLocalInput } from '@/lib/format'

export default function EventForm({ locale, item }: { locale: Locale; item?: EventRow | null }) {
  const d = getDict(locale)
  const [saving, setSaving] = useState(false)
  const [agenda, setAgenda] = useState<AgendaItem[]>(item?.agenda ?? [])
  const [speakers, setSpeakers] = useState<Speaker[]>(item?.speakers ?? [])
  const [isOnline, setIsOnline] = useState(item?.is_online ?? false)

  const setAgendaAt = (i: number, patch: Partial<AgendaItem>) =>
    setAgenda((a) => a.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))
  const setSpeakerAt = (i: number, patch: Partial<Speaker>) =>
    setSpeakers((s) => s.map((row, idx) => (idx === i ? { ...row, ...patch } : row)))

  return (
    <>
      <form action={saveEvent} onSubmit={() => setSaving(true)} className="space-y-6">
        <input type="hidden" name="locale" value={locale} />
        {item && <input type="hidden" name="id" value={item.id} />}
        <input type="hidden" name="agenda" value={JSON.stringify(agenda)} />
        <input type="hidden" name="speakers" value={JSON.stringify(speakers)} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ชื่องาน (ไทย)" required>
            <input name="title_th" required defaultValue={item?.title_th ?? ''} className={inputClass} />
          </Field>
          <Field label="Title (English)">
            <input name="title_en" defaultValue={item?.title_en ?? ''} className={inputClass} />
          </Field>
          <Field label="slug (URL)" hint="เว้นว่างได้">
            <input name="slug" defaultValue={item?.slug ?? ''} className={inputClass} />
          </Field>
          <Field label="สถานะ">
            <select name="status" defaultValue={item?.status ?? 'draft'} className={inputClass}>
              <option value="draft">{d.status.draft}</option>
              <option value="published">{d.status.published}</option>
              <option value="closed">{d.status.closed}</option>
              <option value="cancelled">{d.status.cancelled}</option>
            </select>
          </Field>
        </div>

        <MediaUpload name="cover_url" label="รูปหน้าปก" defaultValue={item?.cover_url ?? ''} folder="events" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="สรุปสั้น (ไทย)">
            <textarea name="summary_th" rows={2} defaultValue={item?.summary_th ?? ''} className={inputClass} />
          </Field>
          <Field label="Summary (English)">
            <textarea name="summary_en" rows={2} defaultValue={item?.summary_en ?? ''} className={inputClass} />
          </Field>
        </div>

        <Field label="รายละเอียด (ไทย)">
          <textarea name="description_th" rows={8} defaultValue={item?.description_th ?? ''} className={inputClass} />
        </Field>
        <Field label="Description (English)">
          <textarea name="description_en" rows={5} defaultValue={item?.description_en ?? ''} className={inputClass} />
        </Field>

        {/* เวลาและสถานที่ */}
        <fieldset className="rounded-xl border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold text-crimson-dark">เวลาและสถานที่</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="เริ่ม" required>
              <input
                type="datetime-local"
                name="starts_at"
                required
                defaultValue={toLocalInput(item?.starts_at)}
                className={inputClass}
              />
            </Field>
            <Field label="สิ้นสุด">
              <input
                type="datetime-local"
                name="ends_at"
                defaultValue={toLocalInput(item?.ends_at)}
                className={inputClass}
              />
            </Field>
            <Field label="เปิดรับลงทะเบียน">
              <input
                type="datetime-local"
                name="register_opens_at"
                defaultValue={toLocalInput(item?.register_opens_at)}
                className={inputClass}
              />
            </Field>
            <Field label="ปิดรับลงทะเบียน">
              <input
                type="datetime-local"
                name="register_closes_at"
                defaultValue={toLocalInput(item?.register_closes_at)}
                className={inputClass}
              />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="is_online"
              checked={isOnline}
              onChange={(e) => setIsOnline(e.target.checked)}
              className="h-4 w-4 accent-[var(--crimson)]"
            />
            งานออนไลน์
          </label>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {isOnline ? (
              <Field label="ลิงก์เข้าร่วม (ส่งให้ผู้ลงทะเบียน)">
                <input name="online_url" defaultValue={item?.online_url ?? ''} className={inputClass} />
              </Field>
            ) : (
              <>
                <Field label="สถานที่ (ไทย)">
                  <input name="venue_th" defaultValue={item?.venue_th ?? ''} className={inputClass} />
                </Field>
                <Field label="Venue (English)">
                  <input name="venue_en" defaultValue={item?.venue_en ?? ''} className={inputClass} />
                </Field>
              </>
            )}
          </div>
        </fieldset>

        {/* ค่าลงทะเบียน */}
        <fieldset className="rounded-xl border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold text-crimson-dark">ค่าลงทะเบียนและที่นั่ง</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={`${d.events.feeMember} (บาท)`}>
              <input type="number" name="fee_member" min={0} defaultValue={item?.fee_member ?? 0} className={inputClass} />
            </Field>
            <Field label={`${d.events.feeNonmember} (บาท)`}>
              <input type="number" name="fee_nonmember" min={0} defaultValue={item?.fee_nonmember ?? 0} className={inputClass} />
            </Field>
            <Field label={`${d.events.feeStudent} (บาท)`}>
              <input type="number" name="fee_student" min={0} defaultValue={item?.fee_student ?? 0} className={inputClass} />
            </Field>
            <Field label="จำนวนที่นั่ง" hint="เว้นว่าง = ไม่จำกัด">
              <input type="number" name="capacity" min={1} defaultValue={item?.capacity ?? ''} className={inputClass} />
            </Field>
            <Field label="หน่วยกิต CE">
              <input type="number" step="0.5" name="ce_credits" min={0} defaultValue={item?.ce_credits ?? 0} className={inputClass} />
            </Field>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="has_certificate"
              defaultChecked={item?.has_certificate ?? true}
              className="h-4 w-4 accent-[var(--crimson)]"
            />
            มีใบรับรองการเข้าร่วม
          </label>
        </fieldset>

        {/* กำหนดการ */}
        <fieldset className="rounded-xl border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold text-crimson-dark">{d.events.agenda}</legend>
          <div className="space-y-3">
            {agenda.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[110px_1fr_1fr_150px_auto]">
                <input
                  value={row.time ?? ''}
                  onChange={(e) => setAgendaAt(i, { time: e.target.value })}
                  placeholder="09:00–10:30"
                  className={inputClass}
                />
                <input
                  value={row.title_th}
                  onChange={(e) => setAgendaAt(i, { title_th: e.target.value })}
                  placeholder="หัวข้อ (ไทย)"
                  className={inputClass}
                />
                <input
                  value={row.title_en ?? ''}
                  onChange={(e) => setAgendaAt(i, { title_en: e.target.value })}
                  placeholder="Topic (EN)"
                  className={inputClass}
                />
                <input
                  value={row.speaker ?? ''}
                  onChange={(e) => setAgendaAt(i, { speaker: e.target.value })}
                  placeholder="วิทยากร"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setAgenda((a) => a.filter((_, idx) => idx !== i))}
                  className="rounded-lg px-2 text-muted hover:text-crimson"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setAgenda((a) => [...a, { time: '', title_th: '' }])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson"
          >
            <Plus className="h-4 w-4" /> เพิ่มช่วงเวลา
          </button>
        </fieldset>

        {/* วิทยากร */}
        <fieldset className="rounded-xl border border-line bg-surface p-5">
          <legend className="px-2 text-sm font-semibold text-crimson-dark">{d.events.speakers}</legend>
          <div className="space-y-3">
            {speakers.map((row, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                <input
                  value={row.name}
                  onChange={(e) => setSpeakerAt(i, { name: e.target.value })}
                  placeholder="ชื่อ (ไทย)"
                  className={inputClass}
                />
                <input
                  value={row.name_en ?? ''}
                  onChange={(e) => setSpeakerAt(i, { name_en: e.target.value })}
                  placeholder="Name (EN)"
                  className={inputClass}
                />
                <input
                  value={row.affiliation ?? ''}
                  onChange={(e) => setSpeakerAt(i, { affiliation: e.target.value })}
                  placeholder="สังกัด"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setSpeakers((s) => s.filter((_, idx) => idx !== i))}
                  className="rounded-lg px-2 text-muted hover:text-crimson"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setSpeakers((s) => [...s, { name: '' }])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-crimson"
          >
            <Plus className="h-4 w-4" /> เพิ่มวิทยากร
          </button>
        </fieldset>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-crimson px-5 py-2.5 font-semibold text-white hover:bg-crimson-dark disabled:opacity-60"
        >
          {saving ? d.common.saving : d.common.save}
        </button>
      </form>

      {item && (
        <form action={deleteEvent} className="mt-8 border-t border-line pt-5">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={item.id} />
          <button className="text-sm text-muted hover:text-crimson">{d.common.delete}</button>
        </form>
      )}
    </>
  )
}
