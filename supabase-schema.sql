-- ============================================================
-- TSTCVM — The Thai Society of Traditional Chinese Veterinary Medicine
-- schema + RLS + storage  (รันทั้งไฟล์ได้ใน Supabase SQL Editor, รันซ้ำได้)
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- helper: updated_at ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id                uuid primary key references auth.users(id) on delete cascade,
  email             text,
  full_name         text,
  full_name_en      text,
  avatar_url        text,
  phone             text,
  license_no        text,                 -- เลขที่ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์
  workplace         text,
  job_title         text,
  province          text,
  line_id           text,
  bio               text,
  member_code       text unique,          -- รหัสสมาชิก ออกให้ตอนอนุมัติครั้งแรก
  role              text not null default 'user' check (role in ('user','admin','superadmin')),
  show_in_directory boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- สร้าง profile อัตโนมัติเมื่อมีผู้ใช้ใหม่ (Google login)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    case when lower(new.email) = 'tstcvm.th@gmail.com' then 'superadmin' else 'user' end
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url);
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- helper: สิทธิ์ (security definer กัน RLS วนลูป) ----------
create or replace function public.is_admin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role in ('admin','superadmin'));
$$;

create or replace function public.is_superadmin(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = uid and p.role = 'superadmin');
$$;

-- ============================================================
-- memberships — 1 แถว = 1 รอบสมาชิก (ต่ออายุ = แถวใหม่)
-- ============================================================
create table if not exists public.memberships (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  member_type       text not null default 'regular'
                    check (member_type in ('regular','student','associate','honorary','lifetime')),
  status            text not null default 'pending'
                    check (status in ('pending','active','rejected','expired','cancelled')),
  fee_amount        numeric(10,2) not null default 0,
  payment_slip_path text,
  payment_ref       text,
  transferred_at    timestamptz,
  start_date        date,
  end_date          date,
  applied_at        timestamptz not null default now(),
  reviewed_by       uuid references public.profiles(id),
  reviewed_at       timestamptz,
  review_note       text,
  applicant_note    text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists memberships_user_idx on public.memberships(user_id);
create index if not exists memberships_status_idx on public.memberships(status);
drop trigger if exists memberships_updated_at on public.memberships;
create trigger memberships_updated_at before update on public.memberships
  for each row execute function public.set_updated_at();

-- ต้องประกาศหลังตาราง memberships
create or replace function public.is_active_member(uid uuid default auth.uid())
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships m
    where m.user_id = uid and m.status = 'active'
      and (m.end_date is null or m.end_date >= current_date)
  );
$$;

-- ออกรหัสสมาชิกอัตโนมัติเมื่ออนุมัติครั้งแรก เช่น TSTCVM-0001
create or replace function public.assign_member_code()
returns trigger language plpgsql security definer set search_path = public as $$
declare nextnum int;
begin
  if new.status = 'active' then
    update public.profiles p
       set member_code = 'TSTCVM-' || lpad((
             select coalesce(max(nullif(regexp_replace(member_code, '\D', '', 'g'), '')::int), 0) + 1
             from public.profiles where member_code is not null
           )::text, 4, '0')
     where p.id = new.user_id and p.member_code is null;
  end if;
  return new;
end $$;
drop trigger if exists memberships_assign_code on public.memberships;
create trigger memberships_assign_code after insert or update of status on public.memberships
  for each row execute function public.assign_member_code();

-- ============================================================
-- news — ข่าวสาร / ประกาศ
-- ============================================================
create table if not exists public.news (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  category     text not null default 'news'
               check (category in ('announcement','news','activity','knowledge')),
  title_th     text not null,
  title_en     text,
  excerpt_th   text,
  excerpt_en   text,
  body_th      text,
  body_en      text,
  cover_url    text,
  is_published boolean not null default false,
  published_at timestamptz,
  is_pinned    boolean not null default false,
  author_id    uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists news_published_idx on public.news(is_published, published_at desc);
drop trigger if exists news_updated_at on public.news;
create trigger news_updated_at before update on public.news
  for each row execute function public.set_updated_at();

-- ============================================================
-- events — งานสัมมนา / อบรม
-- ============================================================
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text unique not null,
  title_th          text not null,
  title_en          text,
  summary_th        text,
  summary_en        text,
  description_th    text,
  description_en    text,
  cover_url         text,
  venue_th          text,
  venue_en          text,
  is_online         boolean not null default false,
  online_url        text,
  starts_at         timestamptz not null,
  ends_at           timestamptz,
  register_opens_at  timestamptz,
  register_closes_at timestamptz,
  capacity          int,
  fee_member        numeric(10,2) not null default 0,
  fee_nonmember     numeric(10,2) not null default 0,
  fee_student       numeric(10,2) not null default 0,
  ce_credits        numeric(5,2) not null default 0,
  has_certificate   boolean not null default true,
  speakers          jsonb not null default '[]'::jsonb,
  agenda            jsonb not null default '[]'::jsonb,
  status            text not null default 'draft'
                    check (status in ('draft','published','closed','cancelled')),
  created_by        uuid references public.profiles(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists events_status_idx on public.events(status, starts_at desc);
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();

-- ============================================================
-- event_registrations — ลงทะเบียนงาน
-- ============================================================
create table if not exists public.event_registrations (
  id                   uuid primary key default gen_random_uuid(),
  event_id             uuid not null references public.events(id) on delete cascade,
  user_id              uuid not null references public.profiles(id) on delete cascade,
  attendee_name        text not null,
  attendee_email       text,
  attendee_phone       text,
  attendee_license_no  text,
  attendee_workplace   text,
  rate_type            text not null default 'nonmember'
                       check (rate_type in ('member','nonmember','student')),
  fee_amount           numeric(10,2) not null default 0,
  payment_slip_path    text,
  transferred_at       timestamptz,
  payment_status       text not null default 'unpaid'
                       check (payment_status in ('unpaid','pending','paid','waived','refunded')),
  status               text not null default 'pending'
                       check (status in ('pending','confirmed','waitlist','cancelled')),
  note                 text,
  checked_in_at        timestamptz,
  checked_in_by        uuid references public.profiles(id),
  certificate_code     text unique,
  certificate_issued_at timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (event_id, user_id)
);
create index if not exists registrations_event_idx on public.event_registrations(event_id);
create index if not exists registrations_user_idx on public.event_registrations(user_id);
drop trigger if exists registrations_updated_at on public.event_registrations;
create trigger registrations_updated_at before update on public.event_registrations
  for each row execute function public.set_updated_at();

-- จำนวนที่นั่งที่ถูกจองแล้ว (ใช้ในหน้าเว็บ ไม่ติด RLS)
create or replace function public.event_seats_taken(eid uuid)
returns int language sql stable security definer set search_path = public as $$
  select count(*)::int from public.event_registrations
  where event_id = eid and status in ('pending','confirmed');
$$;

-- ============================================================
-- settings — ค่าธรรมเนียม / เลขบัญชี / ข้อมูลติดต่อ
-- ============================================================
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id)
);

insert into public.settings (key, value) values
  ('membership_fees', '{"regular":500,"student":200,"associate":500,"lifetime":5000,"honorary":0}'::jsonb),
  ('bank', '{"bank_name":"ธนาคารกรุงไทย","account_name":"ชมรมสัตวแพทย์ฝังเข็มแห่งประเทศไทย","account_no":"xxx-x-xxxxx-x","promptpay":""}'::jsonb),
  ('society', '{"email":"tstcvm.th@gmail.com","phone":"","facebook":"","line":"","address":""}'::jsonb)
on conflict (key) do nothing;

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles             enable row level security;
alter table public.memberships          enable row level security;
alter table public.news                 enable row level security;
alter table public.events               enable row level security;
alter table public.event_registrations  enable row level security;
alter table public.settings             enable row level security;

-- profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select
  using (id = auth.uid() or public.is_admin() or (show_in_directory and public.is_active_member()));
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all
  using (public.is_admin()) with check (public.is_admin());

-- กันผู้ใช้เลื่อนขั้นตัวเอง: role/member_code แก้ได้เฉพาะ superadmin
create or replace function public.guard_profile_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;          -- trigger/service role
  if new.role is distinct from old.role and not public.is_superadmin() then
    raise exception 'เฉพาะ superadmin เท่านั้นที่เปลี่ยนสิทธิ์ได้';
  end if;
  if new.member_code is distinct from old.member_code and not public.is_admin() then
    new.member_code := old.member_code;
  end if;
  return new;
end $$;
drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_changes();

-- memberships
drop policy if exists memberships_select_own on public.memberships;
create policy memberships_select_own on public.memberships for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists memberships_insert_own on public.memberships;
create policy memberships_insert_own on public.memberships for insert
  with check (user_id = auth.uid() and status = 'pending');
drop policy if exists memberships_update_own_pending on public.memberships;
create policy memberships_update_own_pending on public.memberships for update
  using (user_id = auth.uid() and status = 'pending')
  with check (user_id = auth.uid() and status = 'pending');
drop policy if exists memberships_admin_all on public.memberships;
create policy memberships_admin_all on public.memberships for all
  using (public.is_admin()) with check (public.is_admin());

-- news
drop policy if exists news_public_read on public.news;
create policy news_public_read on public.news for select
  using (is_published or public.is_admin());
drop policy if exists news_admin_all on public.news;
create policy news_admin_all on public.news for all
  using (public.is_admin()) with check (public.is_admin());

-- events
drop policy if exists events_public_read on public.events;
create policy events_public_read on public.events for select
  using (status <> 'draft' or public.is_admin());
drop policy if exists events_admin_all on public.events;
create policy events_admin_all on public.events for all
  using (public.is_admin()) with check (public.is_admin());

-- event_registrations
drop policy if exists registrations_select_own on public.event_registrations;
create policy registrations_select_own on public.event_registrations for select
  using (user_id = auth.uid() or public.is_admin());
drop policy if exists registrations_insert_own on public.event_registrations;
create policy registrations_insert_own on public.event_registrations for insert
  with check (user_id = auth.uid());
drop policy if exists registrations_update_own on public.event_registrations;
create policy registrations_update_own on public.event_registrations for update
  using (user_id = auth.uid() and status <> 'cancelled')
  with check (user_id = auth.uid());
drop policy if exists registrations_admin_all on public.event_registrations;
create policy registrations_admin_all on public.event_registrations for all
  using (public.is_admin()) with check (public.is_admin());

-- ผู้ใช้แก้ไขได้เฉพาะข้อมูลของตัวเอง ห้ามแก้สถานะเงิน/เช็กชื่อ/ใบรับรอง
create or replace function public.guard_registration_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;
  new.payment_status := old.payment_status;
  new.status := case when new.status = 'cancelled' then 'cancelled' else old.status end;
  new.checked_in_at := old.checked_in_at;
  new.checked_in_by := old.checked_in_by;
  new.certificate_code := old.certificate_code;
  new.certificate_issued_at := old.certificate_issued_at;
  new.fee_amount := old.fee_amount;
  return new;
end $$;
drop trigger if exists registrations_guard on public.event_registrations;
create trigger registrations_guard before update on public.event_registrations
  for each row execute function public.guard_registration_changes();

-- settings
drop policy if exists settings_public_read on public.settings;
create policy settings_public_read on public.settings for select using (true);
drop policy if exists settings_admin_write on public.settings;
create policy settings_admin_write on public.settings for all
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Storage: media (public) / slips (private)
-- ============================================================
insert into storage.buckets (id, name, public) values ('media','media',true)
  on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('slips','slips',false)
  on conflict (id) do nothing;

drop policy if exists media_public_read on storage.objects;
create policy media_public_read on storage.objects for select
  using (bucket_id = 'media');
drop policy if exists media_admin_write on storage.objects;
create policy media_admin_write on storage.objects for all
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

-- สลิป: อัปโหลด/อ่านได้เฉพาะโฟลเดอร์ของตัวเอง (<user_id>/...) และแอดมิน
drop policy if exists slips_own_write on storage.objects;
create policy slips_own_write on storage.objects for insert
  with check (bucket_id = 'slips' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists slips_own_read on storage.objects;
create policy slips_own_read on storage.objects for select
  using (bucket_id = 'slips'
         and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
drop policy if exists slips_admin_all on storage.objects;
create policy slips_admin_all on storage.objects for all
  using (bucket_id = 'slips' and public.is_admin())
  with check (bucket_id = 'slips' and public.is_admin());

-- ============================================================
-- ตรวจสอบใบรับรองแบบสาธารณะ (ไม่เปิดเผยข้อมูลอื่นของผู้ลงทะเบียน)
-- ============================================================
create or replace function public.verify_certificate(code text)
returns table (
  attendee_name text,
  event_title_th text,
  event_title_en text,
  starts_at timestamptz,
  ends_at timestamptz,
  ce_credits numeric,
  issued_at timestamptz
)
language sql stable security definer set search_path = public as $$
  select r.attendee_name, e.title_th, e.title_en, e.starts_at, e.ends_at,
         e.ce_credits, r.certificate_issued_at
  from public.event_registrations r
  join public.events e on e.id = r.event_id
  where r.certificate_code = code and r.certificate_issued_at is not null;
$$;
grant execute on function public.verify_certificate(text) to anon, authenticated;
