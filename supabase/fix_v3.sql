-- fix_v3.sql — รันครั้งเดียวใน Supabase > SQL Editor (รันซ้ำได้ ไม่พัง)
-- ต้องรัน "ก่อน" อัปโหลดโค้ดใหม่ขึ้นเว็บ

-- 1) คำอวยพรแสดงทันที + รองรับรูปแนบ
alter table wishes add column if not exists photo_url text;
alter table wishes alter column status set default 'approved';

drop policy if exists "wishes_public_insert_pending" on wishes;
drop policy if exists "wishes_public_insert" on wishes;
create policy "wishes_public_insert" on wishes for insert to anon, authenticated
  with check (
    status = 'approved'
    and (photo_url is null or photo_url like '%/storage/v1/object/public/wish-photos/%')
  );

-- 2) Bucket รูปแนบคำอวยพร: รับเฉพาะ JPG/PNG/WebP ไม่เกิน 3MB
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wish-photos', 'wish-photos', true, 3145728, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 3145728,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "wish_photos_public_read" on storage.objects;
create policy "wish_photos_public_read" on storage.objects for select to anon, authenticated
  using (bucket_id = 'wish-photos');

drop policy if exists "wish_photos_public_insert" on storage.objects;
create policy "wish_photos_public_insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'wish-photos');

drop policy if exists "wish_photos_admin_delete" on storage.objects;
create policy "wish_photos_admin_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'wish-photos' and public.is_admin());

select 'ok' as result, count(*) as wishes from wishes;
