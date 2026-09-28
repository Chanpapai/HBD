-- fix_v4.sql — รันครั้งเดียวใน Supabase > SQL Editor (รันซ้ำได้) ก่อนอัปโหลดโค้ดใหม่

-- 1) ตัวเลือก "ไม่ระบุชื่อ": เก็บชื่อจริงไว้ภายใน แต่ไม่ส่งให้สาธารณะ
alter table wishes add column if not exists is_anonymous boolean not null default false;

-- 2) View สาธารณะ: แสดงเฉพาะที่ผู้ส่งอนุญาต (ถ้าไม่ระบุชื่อ จะได้ 'ไม่ระบุชื่อ' ไม่มีชื่อจริงหลุดออกไป)
create or replace view public.public_wishes as
  select id,
         case when is_anonymous then 'ไม่ระบุชื่อ' else nickname end as display_name,
         is_anonymous, message, photo_url, created_at
  from public.wishes
  where status = 'approved';
grant select on public.public_wishes to anon, authenticated;

-- 3) ปิดการอ่านตาราง wishes โดยตรงจากสาธารณะ (กันดึงชื่อจริงผ่าน API) — แอดมินยังอ่านได้ตามเดิม
drop policy if exists "wishes_public_read_approved" on wishes;

-- 4) เลิกใช้รูปหน้าปกวงกลม
delete from settings where key = 'hero_photo_url';

select count(*) as wishes_in_view from public.public_wishes;
