begin;

create type public.application_status as enum (
  'interested',
  'applied',
  'interview_scheduled',
  'interview_completed',
  'awaiting_response',
  'offer_received',
  'rejected',
  'withdrawn'
);

create type public.work_mode as enum ('onsite', 'hybrid', 'remote');
create type public.action_status as enum ('pending', 'completed', 'cancelled');
create type public.action_priority as enum ('low', 'medium', 'high');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_not_blank check (char_length(btrim(full_name)) between 1 and 120)
);

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  website text,
  location text,
  industry text,
  work_mode public.work_mode,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_name_not_blank check (char_length(btrim(name)) between 1 and 160),
  constraint companies_user_id_id_unique unique (user_id, id)
);

create unique index companies_user_name_unique
  on public.companies (user_id, lower(btrim(name)));

create table public.recruiters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid,
  name text not null,
  email text,
  phone text,
  job_title text,
  linkedin_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint recruiters_name_not_blank check (char_length(btrim(name)) between 1 and 160),
  constraint recruiters_user_id_id_unique unique (user_id, id),
  constraint recruiters_company_same_user
    foreign key (user_id, company_id)
    references public.companies (user_id, id)
    on delete set null (company_id)
);

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  company_id uuid not null,
  title text not null,
  location text,
  work_mode public.work_mode,
  employment_type text,
  salary_min numeric(12, 2),
  salary_max numeric(12, 2),
  currency text not null default 'EUR',
  job_url text,
  skills text[] not null default '{}',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint opportunities_title_not_blank check (char_length(btrim(title)) between 1 and 200),
  constraint opportunities_employment_type_not_blank
    check (employment_type is null or char_length(btrim(employment_type)) > 0),
  constraint opportunities_salary_min_non_negative check (salary_min is null or salary_min >= 0),
  constraint opportunities_salary_max_non_negative check (salary_max is null or salary_max >= 0),
  constraint opportunities_salary_range_valid
    check (salary_min is null or salary_max is null or salary_min <= salary_max),
  constraint opportunities_currency_iso check (currency ~ '^[A-Z]{3}$'),
  constraint opportunities_user_id_id_unique unique (user_id, id),
  constraint opportunities_company_same_user
    foreign key (user_id, company_id)
    references public.companies (user_id, id)
    on delete restrict
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  opportunity_id uuid not null,
  primary_recruiter_id uuid,
  status public.application_status not null default 'interested',
  application_date date not null default current_date,
  source text,
  expected_salary numeric(12, 2),
  summary_notes text,
  next_action_summary text,
  follow_up_date date,
  interview_preparation text,
  questions_for_company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint applications_expected_salary_non_negative
    check (expected_salary is null or expected_salary >= 0),
  constraint applications_user_id_id_unique unique (user_id, id),
  constraint applications_opportunity_same_user
    foreign key (user_id, opportunity_id)
    references public.opportunities (user_id, id)
    on delete restrict,
  constraint applications_recruiter_same_user
    foreign key (user_id, primary_recruiter_id)
    references public.recruiters (user_id, id)
    on delete set null (primary_recruiter_id)
);

create table public.interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  interview_type text not null,
  scheduled_at timestamptz not null,
  location_or_url text,
  participants text[] not null default '{}',
  preparation text,
  feedback text,
  result text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint interviews_type_not_blank check (char_length(btrim(interview_type)) between 1 and 120),
  constraint interviews_application_same_user
    foreign key (user_id, application_id)
    references public.applications (user_id, id)
    on delete cascade
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notes_content_not_blank check (char_length(btrim(content)) > 0),
  constraint notes_application_same_user
    foreign key (user_id, application_id)
    references public.applications (user_id, id)
    on delete cascade
);

create table public.actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null,
  description text not null,
  due_date date,
  status public.action_status not null default 'pending',
  priority public.action_priority not null default 'medium',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint actions_description_not_blank check (char_length(btrim(description)) > 0),
  constraint actions_completion_consistent check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  ),
  constraint actions_application_same_user
    foreign key (user_id, application_id)
    references public.applications (user_id, id)
    on delete cascade
);

create index companies_user_created_at_idx on public.companies (user_id, created_at desc);
create index recruiters_user_company_idx on public.recruiters (user_id, company_id);
create index recruiters_user_name_idx on public.recruiters (user_id, lower(name));
create index opportunities_user_company_idx on public.opportunities (user_id, company_id);
create index opportunities_user_created_at_idx on public.opportunities (user_id, created_at desc);
create index applications_user_status_idx on public.applications (user_id, status);
create index applications_user_application_date_idx
  on public.applications (user_id, application_date desc);
create index applications_user_follow_up_idx
  on public.applications (user_id, follow_up_date)
  where follow_up_date is not null;
create index applications_user_opportunity_idx on public.applications (user_id, opportunity_id);
create index interviews_user_application_idx on public.interviews (user_id, application_id);
create index interviews_user_scheduled_at_idx on public.interviews (user_id, scheduled_at);
create index notes_user_application_created_idx
  on public.notes (user_id, application_id, created_at desc);
create index actions_user_application_idx on public.actions (user_id, application_id);
create index actions_user_pending_due_idx
  on public.actions (user_id, due_date)
  where status = 'pending';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger recruiters_set_updated_at
before update on public.recruiters
for each row execute function public.set_updated_at();

create trigger opportunities_set_updated_at
before update on public.opportunities
for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
before update on public.applications
for each row execute function public.set_updated_at();

create trigger interviews_set_updated_at
before update on public.interviews
for each row execute function public.set_updated_at();

create trigger notes_set_updated_at
before update on public.notes
for each row execute function public.set_updated_at();

create trigger actions_set_updated_at
before update on public.actions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.recruiters enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.interviews enable row level security;
alter table public.notes enable row level security;
alter table public.actions enable row level security;

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.companies from anon, authenticated;
revoke all on table public.recruiters from anon, authenticated;
revoke all on table public.opportunities from anon, authenticated;
revoke all on table public.applications from anon, authenticated;
revoke all on table public.interviews from anon, authenticated;
revoke all on table public.notes from anon, authenticated;
revoke all on table public.actions from anon, authenticated;

grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.companies to authenticated;
grant select, insert, update, delete on table public.recruiters to authenticated;
grant select, insert, update, delete on table public.opportunities to authenticated;
grant select, insert, update, delete on table public.applications to authenticated;
grant select, insert, update, delete on table public.interviews to authenticated;
grant select, insert, update, delete on table public.notes to authenticated;
grant select, insert, update, delete on table public.actions to authenticated;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

comment on table public.profiles is 'Perfil público interno associado a auth.users.';
comment on table public.companies is 'Empresas acompanhadas por cada utilizador.';
comment on table public.recruiters is 'Contactos de recrutamento, opcionalmente associados a uma empresa.';
comment on table public.opportunities is 'Vagas ou oportunidades existentes numa empresa.';
comment on table public.applications is 'Candidaturas e respetivo estado, preparação e follow-up.';
comment on table public.interviews is 'Entrevistas associadas a uma candidatura.';
comment on table public.notes is 'Notas cronológicas de uma candidatura.';
comment on table public.actions is 'Próximas ações associadas a uma candidatura.';
comment on column public.applications.interview_preparation is
  'Guião específico da candidatura com respostas e pontos a preparar.';
comment on column public.applications.questions_for_company is
  'Perguntas preparadas pelo candidato para fazer à empresa.';

commit;
