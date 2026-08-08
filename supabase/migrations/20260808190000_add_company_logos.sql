begin;

alter table public.companies
  add column logo_url text;

alter table public.companies
  add constraint companies_logo_url_valid check (
    logo_url is null
    or (
      char_length(btrim(logo_url)) between 1 and 1000
      and logo_url ~ '^https://'
    )
  );

comment on column public.companies.logo_url is
  'Endereço HTTPS opcional do logótipo, escolhido manualmente ou através de um fornecedor externo.';

commit;
