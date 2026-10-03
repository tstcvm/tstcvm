-- ============================================================
-- 002 — ปิดช่องโหว่ราคาและแก้บั๊กลงทะเบียนซ้ำหลังยกเลิก
--  1) ราคาค่าลงทะเบียน/ค่าสมาชิกถูกคิดใหม่ที่ฐานข้อมูลเสมอ ไม่เชื่อค่าที่ client ส่งมา
--  2) ผู้ใช้ที่ยกเลิกการลงทะเบียนแล้ว กลับมาลงทะเบียนงานเดิมได้อีก
-- ============================================================

/** อัตราค่าลงทะเบียนที่ถูกต้องของผู้ใช้คนนี้สำหรับงานนี้ */
create or replace function public.event_fee_for(eid uuid, uid uuid)
returns numeric language sql stable security definer set search_path = public as $$
  select case
           when exists (
             select 1 from public.memberships m
             where m.user_id = uid and m.status = 'active'
               and (m.end_date is null or m.end_date >= current_date)
               and m.member_type = 'student'
           ) then coalesce(nullif(e.fee_student, 0), e.fee_member)
           when public.is_active_member(uid) then e.fee_member
           else e.fee_nonmember
         end
  from public.events e
  where e.id = eid;
$$;

/** ประเภทอัตราที่ถูกต้องของผู้ใช้คนนี้ */
create or replace function public.rate_type_for(uid uuid)
returns text language sql stable security definer set search_path = public as $$
  select case
           when exists (
             select 1 from public.memberships m
             where m.user_id = uid and m.status = 'active'
               and (m.end_date is null or m.end_date >= current_date)
               and m.member_type = 'student'
           ) then 'student'
           when public.is_active_member(uid) then 'member'
           else 'nonmember'
         end;
$$;

create or replace function public.guard_registration_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- service role / trigger ภายใน และแอดมิน แก้ได้ทุกอย่าง
  if auth.uid() is null or public.is_admin() then return new; end if;

  -- ราคาและอัตราคิดจากฐานข้อมูลเสมอ
  new.rate_type  := public.rate_type_for(new.user_id);
  new.fee_amount := coalesce(public.event_fee_for(new.event_id, new.user_id), 0);

  if tg_op = 'INSERT' then
    new.payment_status := case when new.fee_amount = 0 then 'waived'
                               when new.payment_slip_path is not null then 'pending'
                               else 'unpaid' end;
    new.status := case when new.status = 'waitlist' then 'waitlist'
                       when new.fee_amount = 0 then 'confirmed'
                       else 'pending' end;
    new.checked_in_at := null;
    new.checked_in_by := null;
    new.certificate_code := null;
    new.certificate_issued_at := null;
    return new;
  end if;

  if old.status = 'cancelled' then
    -- ลงทะเบียนใหม่หลังยกเลิก: เริ่มรอบใหม่ได้ แต่สถานะเงินกลับไปเป็นรอตรวจ
    new.payment_status := case when new.fee_amount = 0 then 'waived'
                               when new.payment_slip_path is not null then 'pending'
                               else 'unpaid' end;
    new.status := case when new.status = 'waitlist' then 'waitlist'
                       when new.fee_amount = 0 then 'confirmed'
                       else 'pending' end;
  else
    -- การลงทะเบียนที่ยังใช้งานอยู่: ผู้ใช้แก้ได้แค่ข้อมูลติดต่อ กับยกเลิก
    new.payment_status := old.payment_status;
    new.status := case when new.status = 'cancelled' then 'cancelled' else old.status end;
    new.fee_amount := old.fee_amount;
    new.rate_type := old.rate_type;
  end if;

  new.checked_in_at := old.checked_in_at;
  new.checked_in_by := old.checked_in_by;
  new.certificate_code := old.certificate_code;
  new.certificate_issued_at := old.certificate_issued_at;
  return new;
end $$;

drop trigger if exists registrations_guard on public.event_registrations;
create trigger registrations_guard before insert or update on public.event_registrations
  for each row execute function public.guard_registration_changes();

/** ค่าสมาชิกคิดจาก settings.membership_fees เสมอ */
create or replace function public.guard_membership_changes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null or public.is_admin() then return new; end if;

  new.fee_amount := coalesce(
    (select (value ->> new.member_type)::numeric from public.settings where key = 'membership_fees'),
    0
  );

  if tg_op = 'INSERT' then
    new.status := 'pending';
    new.start_date := null;
    new.end_date := null;
    new.reviewed_by := null;
    new.reviewed_at := null;
    new.review_note := null;
  else
    new.status := old.status;
    new.start_date := old.start_date;
    new.end_date := old.end_date;
    new.reviewed_by := old.reviewed_by;
    new.reviewed_at := old.reviewed_at;
    new.review_note := old.review_note;
  end if;
  return new;
end $$;

drop trigger if exists memberships_guard on public.memberships;
create trigger memberships_guard before insert or update on public.memberships
  for each row execute function public.guard_membership_changes();

grant execute on function public.event_fee_for(uuid, uuid) to authenticated;
grant execute on function public.rate_type_for(uuid) to authenticated;
