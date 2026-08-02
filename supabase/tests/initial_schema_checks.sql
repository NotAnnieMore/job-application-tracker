-- Verificações de catálogo para executar no SQL Editor depois da migração inicial.
-- Este ficheiro não altera dados.

do $$
declare
  expected_tables constant text[] := array[
    'actions',
    'applications',
    'companies',
    'interviews',
    'notes',
    'opportunities',
    'profiles',
    'recruiters'
  ];
  missing_tables text[];
begin
  select array_agg(expected_table order by expected_table)
  into missing_tables
  from unnest(expected_tables) as expected_table
  where not exists (
    select 1
    from pg_catalog.pg_tables
    where schemaname = 'public'
      and tablename::text = expected_table
  );

  if missing_tables is not null then
    raise exception 'Faltam tabelas: %', array_to_string(missing_tables, ', ');
  end if;

  if exists (
    select 1
    from pg_catalog.pg_tables
    where schemaname = 'public'
      and tablename::text = any(expected_tables)
      and not rowsecurity
  ) then
    raise exception 'Existe pelo menos uma tabela funcional sem RLS ativo.';
  end if;

  if exists (
    select 1
    from pg_catalog.pg_policies
    where schemaname = 'public'
      and tablename::text = any(expected_tables)
  ) then
    raise exception 'A Fase 3 não deve criar políticas RLS antes dos testes de autenticação.';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'applications'
      and column_name = 'interview_preparation'
  ) or not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'applications'
      and column_name = 'questions_for_company'
  ) then
    raise exception 'Faltam os campos de preparação da candidatura.';
  end if;

  raise notice 'Esquema inicial validado: 8 tabelas, RLS ativo e sem políticas prematuras.';
end;
$$;

select
  tablename as tabela,
  rowsecurity as rls_ativo
from pg_catalog.pg_tables
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
  ])
order by tablename;
