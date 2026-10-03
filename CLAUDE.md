# TSTCVM — ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย (notes for Claude)

เว็บชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย (The Thai Society of Traditional Chinese Veterinary Medicine)
เจ้าของเป็นสัตวแพทย์ (armmani) · อีเมลหลักของชมรม `tstcvm.th@gmail.com`

## Stack / โครงสร้าง

- Next.js 16 (App Router, `src/`, Turbopack) + Tailwind v4 + Supabase (`@supabase/ssr`) + Google OAuth
- สองภาษา: ไทยไม่มี prefix (`/`), อังกฤษขึ้นต้น `/en` — rewrite ที่ `src/proxy.ts` (Next 16 ไม่ใช้ `middleware.ts`)
- คำแปล UI อยู่ใน `src/lib/i18n.ts` (`dictionaries.th/.en`) · เนื้อหาใน DB เก็บสองคอลัมน์ `*_th` / `*_en` อ่านด้วย `pick(row,'title',locale)`
- หน้า public อ่านผ่าน `supabasePublic` (ไม่มี cookie → ยัง static/ISR ได้) · หน้าที่ต้องรู้ตัวตนใช้ `createClient()` จาก `server.ts`
- หน้าที่ต้องล็อกอิน: `/me`, `/members`, `/admin`, `/events/<slug>/register` (คุมที่ `src/proxy.ts`)
- dev port **3010** (`.claude/launch.json` → `tstcvm-dev`)

## สิทธิ์

`profiles.role` = `user` | `admin` | `superadmin` — trigger `handle_new_user()` ตั้ง `tstcvm.th@gmail.com` เป็น superadmin อัตโนมัติ
superadmin เท่านั้นที่เปลี่ยน role ได้ (trigger `guard_profile_changes`) · admin ทำได้ทุกอย่างยกเว้นเปลี่ยนสิทธิ์

## กฎที่ต้องรักษาไว้

1. **ราคาคิดฝั่งเซิร์ฟเวอร์เสมอ** — ค่าสมาชิกอ่านจาก `settings.membership_fees`, ค่าลงทะเบียนงานอ่านจาก `events.fee_*`
   และอัตรา (member/student/nonmember) ตัดสินจาก `getActiveMembership()` ใน server action ห้ามเชื่อค่าจากฟอร์ม
2. **`datetime-local` เป็นเวลาไทยเสมอ** — ใช้ `bangkokToIso()` ตอนบันทึก และ `isoToBangkokInput()` ตอนแสดง
   (server action รันบน Vercel ที่ TZ=UTC ถ้าปล่อยให้ `new Date()` เดาจะเพี้ยน 7 ชม.)
3. **สลิปอยู่ใน bucket `slips` (private)** — ผู้ใช้อัปโหลดได้เฉพาะโฟลเดอร์ `<user_id>/…` แอดมินดูผ่าน signed URL
   รูปข่าว/งานอยู่ใน bucket `media` (public, เขียนได้เฉพาะแอดมิน)
4. **ผู้ใช้แก้สถานะเงิน/เช็กชื่อ/ใบรับรองเองไม่ได้** — trigger `guard_registration_changes` เขียนค่าเดิมทับให้
5. ใบรับรองตรวจสอบสาธารณะผ่าน RPC `verify_certificate(code)` เท่านั้น (ไม่เปิดข้อมูลอื่นของผู้ลงทะเบียน)

## ไฟล์สำคัญ

- `supabase-schema.sql` — ตาราง + RLS + trigger + bucket + policy (รันซ้ำได้)
- `src/lib/actions/*` — server action ทั้งหมด (membership / registration / profile / admin)
- `src/lib/queries.ts` — query ของหน้า public (มี guard `hasSupabase` ให้ build ผ่านตอนไม่มี env)

## Migration ที่รันแล้ว

- `supabase-schema.sql` (2026-10-03) — ตาราง/RLS/trigger/bucket ครบ
- `supabase-migration-002-guards.sql` (2026-10-03) — บังคับให้ `fee_amount`/`rate_type` คิดจาก DB
  (`event_fee_for()`, `rate_type_for()`, `settings.membership_fees`) และแก้บั๊กที่ผู้ใช้ซึ่งยกเลิก
  การลงทะเบียนแล้วกลับมาลงทะเบียนงานเดิมไม่ได้

รัน migration ใหม่ด้วย Management API (token อยู่ใน keychain ชื่อ `supabase-mgmt-tstcvm`):
`python3 <scratchpad>/run_sql.py <file.sql>` — หรือดู README

## บัญชีและค่าที่เกี่ยวข้อง

- Supabase project ref `dgjkvhwkjnoeqqezoozi` (org `tstcvm's Org`)
- Vercel `tstcvm/tstcvm` → **https://tstcvm.vercel.app**
- GitHub `tstcvm/tstcvm` (บัญชีแยกจาก armmani, PAT classic อยู่ใน keychain, `credential.useHttpPath=true`)
- Google Cloud project `quixotic-module-510510-p0` ในบัญชี `tstcvm.th@gmail.com` (authuser=5 ใน Chrome)
  OAuth client "TSTCVM Web" · consent screen **In production** แล้ว
