begin;

alter table public.profiles
  add column avatar_path text;

alter table public.profiles
  add constraint profiles_avatar_path_matches_user
  check (avatar_path is null or avatar_path = id::text || '/avatar');

comment on column public.profiles.avatar_path is
  'Caminho do avatar do utilizador no bucket público avatars.';

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "avatars_select_own"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'avatars'
  and owner_id = (select auth.uid()::text)
);

create policy "avatars_insert_own"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'avatars'
  and name = (select auth.uid()::text) || '/avatar'
);

create policy "avatars_update_own"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'avatars'
  and name = (select auth.uid()::text) || '/avatar'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'avatars'
  and name = (select auth.uid()::text) || '/avatar'
  and owner_id = (select auth.uid()::text)
);

create policy "avatars_delete_own"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'avatars'
  and name = (select auth.uid()::text) || '/avatar'
  and owner_id = (select auth.uid()::text)
);

commit;
