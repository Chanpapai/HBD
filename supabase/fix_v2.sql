-- ============================================================
-- fix_v2.sql — รันซ้ำได้กี่ครั้งก็ไม่พัง (idempotent)
-- วิธีใช้: Supabase Dashboard > SQL Editor > New query > วางทั้งไฟล์ > Run
--
-- แก้ปัญหา: คำอวยพรที่ส่งสำเร็จ แต่ไม่โผล่ในหน้า Admin
-- สาเหตุ: ตาราง wishes มี policy อ่านได้เฉพาะแถวที่ status = 'approved'
--         แอดมินเลยมองไม่เห็นคำอวยพรที่ยัง 'pending' (ไม่มี policy SELECT สำหรับแอดมิน)
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
