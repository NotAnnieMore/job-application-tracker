-- Verifica a integração do recrutador principal nas transações de candidaturas.
-- Este ficheiro não altera dados.

do $$
declare
  function_record record;
begin
  if (
    select count(*)
    from pg_catalog.pg_proc
    join pg_catalog.pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = any(array[
        'create_application_with_opportunity',
        'update_application_with_opportunity'
      ])
      and 'p_primary_recruiter_id' = any(pg_proc.proargnames)
  ) <> 2 then
    raise exception 'As duas transações devem aceitar p_primary_recruiter_id.';
  end if;

  for function_record in
    select pg_proc.oid, pg_proc.proname
    from pg_catalog.pg_proc
    join pg_catalog.pg_namespace
      on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = any(array[
        'create_application_with_opportunity',
        'update_application_with_opportunity'
      ])
  loop
    if has_function_privilege('anon', function_record.oid, 'EXECUTE') then
      raise exception 'A role anon não deve executar %.', function_record.proname;
    end if;

    if not has_function_privilege(
      'authenticated', function_record.oid, 'EXECUTE'
    ) then
      raise exception 'A role authenticated deve executar %.', function_record.proname;
    end if;
  end loop;

  if exists (
    select 1
    from public.applications as application
    join public.opportunities as opportunity
      on opportunity.id = application.opportunity_id
     and opportunity.user_id = application.user_id
    join public.recruiters as recruiter
      on recruiter.id = application.primary_recruiter_id
     and recruiter.user_id = application.user_id
    where recruiter.company_id is not null
      and recruiter.company_id <> opportunity.company_id
  ) then
    raise exception 'Existe uma candidatura com recrutador de outra empresa.';
  end if;

  raise notice 'Integração do recrutador principal validada com sucesso.';
end;
$$;

select
  pg_proc.proname as funcao,
  pg_get_function_arguments(pg_proc.oid) as argumentos,
  has_function_privilege('authenticated', pg_proc.oid, 'EXECUTE') as autenticado
from pg_catalog.pg_proc
join pg_catalog.pg_namespace
  on pg_namespace.oid = pg_proc.pronamespace
where pg_namespace.nspname = 'public'
  and pg_proc.proname = any(array[
    'create_application_with_opportunity',
    'update_application_with_opportunity'
  ])
order by pg_proc.proname;
