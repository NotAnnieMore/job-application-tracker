begin;

alter table public.profiles
  add column onboarding_version smallint not null default 0,
  add constraint profiles_onboarding_version_nonnegative
    check (onboarding_version >= 0);

comment on column public.profiles.onboarding_version is
  'Versão mais recente do onboarding concluída ou dispensada pelo utilizador.';

commit;
