-- Verifica as funções transacionais usadas pelo fluxo de candidaturas.
-- Este ficheiro não altera dados.

do $$
declare
  function_record record;
begin
  if not exists (
    select 1
    from pg_catalog.pg_indexes
    where schemaname = 'public'
      and indexname = 'applications_user_opportunity_unique'
  ) then
    raise exception 'O índice único de candidatura por oportunidade não existe.';
  end if;

  if (
    select count(*)
    from pg_catalog.pg_proc
    join pg_catalog.pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = any(array[
        'create_application_with_opportunity',
        'update_application_with_opportunity',
        'delete_application_with_opportunity'
      ])
  ) <> 3 then
    raise exception 'Esperadas três funções transacionais de candidaturas.';
  end if;

  for function_record in
    select pg_proc.oid, pg_proc.proname
    from pg_catalog.pg_proc
    join pg_catalog.pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = any(array[
        'create_application_with_opportunity',
        'update_application_with_opportunity',
        'delete_application_with_opportunity'
      ])
  loop
    if has_function_privilege('anon', function_record.oid, 'EXECUTE') then
      raise exception 'A role anon não deve executar %.', function_record.proname;
    end if;

    if not has_function_privilege(
      'authenticated',
      function_record.oid,
      'EXECUTE'
    ) then
      raise exception 'A role authenticated deve executar %.', function_record.proname;
    end if;
  end loop;

  raise notice 'Funções transacionais de candidaturas validadas.';
end;
$$;

select
  pg_proc.proname as funcao,
  pg_get_function_arguments(pg_proc.oid) as argumentos,
  pg_get_function_result(pg_proc.oid) as retorno
from pg_catalog.pg_proc
join pg_catalog.pg_namespace
  on pg_namespace.oid = pg_proc.pronamespace
where pg_namespace.nspname = 'public'
  and pg_proc.proname like '%application_with_opportunity'
order by pg_proc.proname;
