do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'onboarding_version'
      and data_type = 'smallint'
      and is_nullable = 'NO'
      and column_default like '0%'
  ) then
    raise exception 'profiles.onboarding_version não existe ou tem uma definição incorreta';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_onboarding_version_nonnegative'
      and conrelid = 'public.profiles'::regclass
  ) then
    raise exception 'A restrição de versão não negativa do onboarding não existe';
  end if;

  raise notice 'Persistência do onboarding configurada corretamente.';
end
$$;

select
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
  and column_name = 'onboarding_version';
