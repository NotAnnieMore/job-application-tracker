-- Verificações de catálogo para executar depois da migração de autenticação.
-- Este ficheiro não altera dados.

do $$
declare
  policy_count integer;
begin
  select count(*)
  into policy_count
  from pg_catalog.pg_policies
  where schemaname = 'public'
    and tablename::text = any(array[
      'actions',
      'applications',
      'companies',
      'interviews',
      'notes',
      'opportunities',
      'profiles',
      'recruiters'
    ]);

  if policy_count <> 30 then
    raise exception 'Esperadas 30 políticas RLS; encontradas %.', policy_count;
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_trigger
    where tgname = 'on_auth_user_created'
      and not tgisinternal
  ) then
    raise exception 'O trigger on_auth_user_created não existe.';
  end if;

  if has_table_privilege('anon', 'public.profiles', 'SELECT')
    or has_table_privilege('anon', 'public.companies', 'SELECT') then
    raise exception 'A role anon não deve ter acesso às tabelas privadas.';
  end if;

  if has_table_privilege('authenticated', 'public.profiles', 'INSERT')
    or has_table_privilege('authenticated', 'public.profiles', 'DELETE') then
    raise exception 'Perfis só podem ser criados pelo trigger e removidos com a conta.';
  end if;

  raise notice 'Catálogo de autenticação validado: trigger e 30 políticas RLS.';
end;
$$;

select
  tablename as tabela,
  policyname as politica,
  cmd as operacao,
  roles
from pg_catalog.pg_policies
where schemaname = 'public'
order by tablename, cmd, policyname;
