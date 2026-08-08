-- Verifica a expansão da tabela de entrevistas.
-- Este ficheiro não altera dados.

do $$
begin
  if (
    select count(*)
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'interviews'
      and column_name = any(array[
        'recruiter_id',
        'status',
        'format',
        'duration_minutes'
      ])
  ) <> 4 then
    raise exception 'Faltam colunas da gestão real de entrevistas.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conname = 'interviews_recruiter_same_user'
      and contype = 'f'
  ) then
    raise exception 'Falta a relação segura entre entrevistas e recrutadores.';
  end if;

  if has_table_privilege('anon', 'public.interviews', 'SELECT') then
    raise exception 'A role anon não deve consultar entrevistas.';
  end if;

  if not has_table_privilege(
    'authenticated',
    'public.interviews',
    'SELECT, INSERT, UPDATE, DELETE'
  ) then
    raise exception 'A role authenticated deve gerir entrevistas.';
  end if;

  if not (
    select relrowsecurity
    from pg_catalog.pg_class
    join pg_catalog.pg_namespace
      on pg_namespace.oid = pg_class.relnamespace
    where pg_namespace.nspname = 'public'
      and pg_class.relname = 'interviews'
  ) then
    raise exception 'A tabela interviews deve manter RLS ativo.';
  end if;

  raise notice 'Gestão real de entrevistas validada com sucesso.';
end;
$$;

select
  column_name,
  data_type,
  udt_name,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and table_name = 'interviews'
  and column_name = any(array[
    'recruiter_id',
    'status',
    'format',
    'duration_minutes'
  ])
order by ordinal_position;
