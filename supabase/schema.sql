-- ============================================================
-- Happy Birthday Website — Supabase schema + RLS policies
-- วิธีใช้: เปิด Supabase Dashboard > SQL Editor > วางไฟล์นี้ทั้งหมด > Run
-- ============================================================

-- ---------- ตารางแอดมิน (ใช้เช็คสิทธิ์เท่านั้น ไม่มีการ select โดย public) ----------
create table if not exists admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz default now()
);

alter table admin_users enable row level security;
-- ไม่สร้าง policy ใด ๆ ให้ public เลย -> default deny ทั้งหมด
-- (แอดมินเช็คสิทธิ์ตัวเองผ่าน policy ของตารางอื่นที่ EXISTS ไปหาแถวนี้)

-- ---------- ตารางรูปแกลเลอรี ----------
create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  is_hero boolean default false,
  created_at timestamptz default now()
);

alter table photos enable row level security;

create policy "photos_public_read"
  on photos for select
  to anon, authenticated
  using (true);

create policy "photos_admin_write"
  on photos for insert
  to authenticated
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "photos_admin_update"
  on photos for update
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "photos_admin_delete"
  on photos for delete
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- ---------- ตารางคำอวยพร ----------
create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 60),
  message text not null check (char_length(message) between 1 and 300),
  status text not null default 'pending' check (status in ('pending', 'approved')),
  created_at timestamptz default now()
);

alter table wishes enable row level security;

-- ผู้ชมทั่วไปเห็นเฉพาะคำอวยพรที่อนุมัติแล้ว
create policy "wishes_public_read_approved"
  on wishes for select
  to anon, authenticated
  using (status = 'approved');

-- ผู้ชมทั่วไปส่งคำอวยพรใหม่ได้ แต่บังคับ status เป็น pending เท่านั้น (กันคนส่ง status=approved มาเอง)
create policy "wishes_public_insert_pending"
  on wishes for insert
  to anon, authenticated
  with check (status = 'pending');

-- อนุมัติ/แก้ไข/ลบ ทำได้เฉพาะแอดมิน
create policy "wishes_admin_update"
  on wishes for update
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "wishes_admin_delete"
  on wishes for delete
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- ---------- ตารางตั้งค่าเว็บไซต์ (ข้อความหน้าแรก, QR, หมายเหตุการรับของขวัญ) ----------
create table if not exists settings (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

create policy "settings_public_read"
  on settings for select
  to anon, authenticated
  using (true);

create policy "settings_admin_write"
  on settings for insert
  to authenticated
  with check (exists (select 1 from admin_users where user_id = auth.uid()));

create policy "settings_admin_update"
  on settings for update
  to authenticated
  using (exists (select 1 from admin_users where user_id = auth.uid()));

-- ค่าเริ่มต้น (แก้ไขได้ทีหลังผ่านหน้า Admin)
insert into settings (key, value) values
  ('hero_title', 'Happy Birthday to Me 🎂'),
  ('hero_subtitle', 'ขอบคุณทุกคนที่แวะมาฉลองวันพิเศษนี้ด้วยกันนะ 🎉'),
  ('qr_url', ''),
  ('payment_note', ''),
  ('owner_full_name', 'นาย ปรเมศ ชาญป่าไพร'),
  ('owner_nickname', '9'),
  ('owner_birth_year_be', '2552')
on conflict (key) do nothing;

-- ============================================================
-- Storage buckets: gallery (รูปแฮป + รูปหน้าปก), qr (รูป QR Code)
-- สร้าง bucket ผ่าน Dashboard > Storage หรือรันคำสั่งด้านล่างนี้ก็ได้
-- ============================================================

insert into storage.buckets (id, name, public)
values ('gallery', 'gallery', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('qr', 'qr', true)
on conflict (id) do nothing;

-- อ่านไฟล์ได้แบบ public (bucket ตั้งเป็น public แล้ว แต่เพิ่ม policy ให้ชัดเจน)
create policy "gallery_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'gallery');

create policy "qr_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'qr');

-- อัปโหลด/ลบไฟล์ได้เฉพาะแอดมิน
create policy "gallery_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'gallery'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "gallery_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "qr_admin_write"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'qr'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

create policy "qr_admin_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'qr'
    and exists (select 1 from admin_users where user_id = auth.uid())
  );

-- ============================================================
-- ขั้นตอนสุดท้าย: ตั้งตัวเองเป็นแอดมิน
-- 1) ไปที่ Authentication > Users แล้วสร้างผู้ใช้ด้วยอีเมล/รหัสผ่านของคุณ
-- 2) คัดลอก user id ของบัญชีนั้น
-- 3) รันคำสั่งนี้ (แทน 'YOUR-USER-UUID' ด้วย uuid จริง):
--
-- insert into admin_users (user_id) values ('YOUR-USER-UUID');
-- ============================================================

-- ============================================================
-- v2: แก้ RLS ให้แอดมินเห็นคำอวยพรที่รอตรวจ + ค่าเริ่มต้นส่วนของขวัญ
-- (เนื้อหาเดียวกับไฟล์ fix_v2.sql — ใช้ fix_v2.sql ถ้าเคยรัน schema.sql ไปแล้ว)
-- ============================================================
-- 1) ฟังก์ชันเช็คสิทธิ์แอดมิน (security definer = อ่าน admin_users ได้โดยไม่ติด RLS)
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- 2) ให้ผู้ที่ล็อกอินอ่านแถวของตัวเองใน admin_users ได้ (หน้า Admin ใช้เช็คสิทธิ์)
drop policy if exists "admin_users_self_read" on admin_users;
create policy "admin_users_self_read"
  on admin_users for select
  to authenticated
  using (user_id = auth.uid());

-- 3) ★ จุดที่ทำให้คำอวยพรไม่โผล่: แอดมินอ่านคำอวยพรได้ทุกสถานะ
drop policy if exists "wishes_admin_read" on wishes;
create policy "wishes_admin_read"
  on wishes for select
  to authenticated
  using (public.is_admin());

-- 4) สร้าง policy ฝั่งแอดมินของตารางอื่นใหม่ให้ใช้ is_admin() (เสถียรกว่า)
drop policy if exists "wishes_admin_update" on wishes;
create policy "wishes_admin_update"
  on wishes for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "wishes_admin_delete" on wishes;
create policy "wishes_admin_delete"
  on wishes for delete to authenticated
  using (public.is_admin());

drop policy if exists "photos_admin_write" on photos;
create policy "photos_admin_write"
  on photos for insert to authenticated
  with check (public.is_admin());

drop policy if exists "photos_admin_update" on photos;
create policy "photos_admin_update"
  on photos for update to authenticated
  using (public.is_admin());

drop policy if exists "photos_admin_delete" on photos;
create policy "photos_admin_delete"
  on photos for delete to authenticated
  using (public.is_admin());

drop policy if exists "settings_admin_write" on settings;
create policy "settings_admin_write"
  on settings for insert to authenticated
  with check (public.is_admin());

drop policy if exists "settings_admin_update" on settings;
create policy "settings_admin_update"
  on settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5) Storage: แอดมินอัปโหลด/ลบไฟล์ใน bucket gallery และ qr
drop policy if exists "gallery_admin_write" on storage.objects;
create policy "gallery_admin_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "gallery_admin_delete" on storage.objects;
create policy "gallery_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'gallery' and public.is_admin());

drop policy if exists "qr_admin_write" on storage.objects;
create policy "qr_admin_write"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'qr' and public.is_admin());

drop policy if exists "qr_admin_delete" on storage.objects;
create policy "qr_admin_delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'qr' and public.is_admin());

-- 6) ค่าเริ่มต้นของส่วน "ให้ของขวัญ" (QR ธนาคาร + QR TrueMoney แยกกัน)
--    ปล่อย qr_*_url ว่างไว้ = เว็บใช้รูปเริ่มต้นใน /public/qr/ ให้เอง
insert into settings (key, value) values
  ('qr_bank_url', ''),
  ('qr_truemoney_url', ''),
  ('gift_bank_text', 'พร้อมเพย์ / TrueMoney: 0645742422'),
  ('gift_truemoney_text', 'พร้อมเพย์ / TrueMoney: 0645742422')
on conflict (key) do nothing;

-- 7) ตรวจผล (ควรเห็น admin_users = 1 และ policy ของ wishes ครบ 5 อัน)
select 'admin_users' as item, count(*)::text as value from admin_users
union all
select 'wishes policies', string_agg(policyname, ', ' order by policyname)
from pg_policies where tablename = 'wishes';
