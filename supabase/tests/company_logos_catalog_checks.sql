-- Verificações de catálogo para executar depois da migração de logótipos.
-- Este ficheiro não altera dados.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'companies'
      and column_name = 'logo_url'
      and data_type = 'text'
      and is_nullable = 'YES'
  ) then
    raise exception 'Falta a coluna opcional companies.logo_url.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.companies'::regclass
      and conname = 'companies_logo_url_valid'
      and contype = 'c'
  ) then
    raise exception 'Falta a validação companies_logo_url_valid.';
  end if;

  raise notice 'Campo de logótipo validado com sucesso.';
end;
$$;

select
  column_name as coluna,
  data_type as tipo,
  is_nullable as aceita_nulo
from information_schema.columns
where table_schema = 'public'
  and table_name = 'companies'
  and column_name = 'logo_url';
