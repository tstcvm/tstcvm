# TSTCVM

เว็บไซต์ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย — The Thai Society of Traditional Chinese Veterinary Medicine

ข่าวสาร · สมัครสมาชิก · ทำเนียบสมาชิก · ลงทะเบียนงานสัมมนา · ใบรับรอง/CE · ระบบผู้ดูแล

## เริ่มใช้งาน

```bash
npm install
cp .env.local.example .env.local   # ใส่ค่า Supabase
npm run dev                        # http://localhost:3010
```

## ตั้งค่า Supabase

1. รัน `supabase-schema.sql` ทั้งไฟล์ใน SQL Editor
2. Authentication → Providers → เปิด Google แล้วใส่ Client ID / Secret จาก Google Cloud Console
3. Authentication → URL Configuration → Site URL + Redirect URLs (`https://<domain>/auth/callback`)

## Stack

Next.js 16 · Tailwind v4 · Supabase (Auth/Postgres/Storage) · Vercel
