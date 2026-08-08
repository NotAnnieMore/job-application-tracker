do $$
declare
  policy_count integer;
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'avatar_path'
      and data_type = 'text'
      and is_nullable = 'YES'
  ) then
    raise exception 'profiles.avatar_path não existe ou tem uma definição incorreta';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_avatar_path_matches_user'
      and conrelid = 'public.profiles'::regclass
  ) then
    raise exception 'A restrição do caminho do avatar não existe';
  end if;

  if not exists (
    select 1
    from storage.buckets
    where id = 'avatars'
      and public = true
      and file_size_limit = 2097152
      and allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp']::text[]
  ) then
    raise exception 'O bucket avatars não tem a configuração esperada';
  end if;

  select count(*)
  into policy_count
  from pg_policies
  where schemaname = 'storage'
    and tablename = 'objects'
    and policyname in (
      'avatars_select_own',
      'avatars_insert_own',
      'avatars_update_own',
      'avatars_delete_own'
    );

  if policy_count <> 4 then
    raise exception 'Esperadas 4 políticas de avatar, encontradas %', policy_count;
  end if;

  raise notice 'Perfil e armazenamento de avatares configurados corretamente.';
end
$$;

select
  id,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'avatars';
