-- The photos table/RLS/realtime already exist from init_schema.sql — this
-- just adds the Storage bucket they point at (storage_path), which was never
-- created since the gallery feature wasn't built yet. Same permissive model
-- as the rest of the schema (CLAUDE.md-sanctioned tradeoff for 5 trusted
-- friends over one weekend): public bucket, anyone can upload/delete.

insert into storage.buckets (id, name, public)
values ('trip-photos', 'trip-photos', true)
on conflict (id) do nothing;

create policy "trip-photos public read" on storage.objects
  for select using (bucket_id = 'trip-photos');

create policy "trip-photos anyone can upload" on storage.objects
  for insert with check (bucket_id = 'trip-photos');

create policy "trip-photos anyone can delete" on storage.objects
  for delete using (bucket_id = 'trip-photos');
