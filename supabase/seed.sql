-- Dados opcionais de demonstração para desenvolvimento.
-- Executar apenas depois de existir pelo menos uma conta em auth.users.
-- O script associa os registos à conta mais antiga e não deve ser usado em produção.

do $$
declare
  seed_user_id uuid;
begin
  select id
  into seed_user_id
  from auth.users
  order by created_at
  limit 1;

  if seed_user_id is null then
    raise exception 'Cria primeiro uma conta de teste antes de executar supabase/seed.sql.';
  end if;

  insert into public.companies (id, user_id, name, website, location, industry, work_mode, notes)
  values (
    '00000000-0000-4000-8000-000000000101',
    seed_user_id,
    'Empresa de demonstração',
    'https://example.com',
    'Lisboa',
    'Tecnologia',
    'hybrid',
    'Registo criado apenas para validar o modelo de dados.'
  )
  on conflict (id) do nothing;

  insert into public.recruiters (id, user_id, company_id, name, email, job_title)
  values (
    '00000000-0000-4000-8000-000000000201',
    seed_user_id,
    '00000000-0000-4000-8000-000000000101',
    'Recrutador de demonstração',
    'recrutador@example.com',
    'Talent Acquisition'
  )
  on conflict (id) do nothing;

  insert into public.opportunities (
    id,
    user_id,
    company_id,
    title,
    location,
    work_mode,
    employment_type,
    salary_min,
    salary_max,
    skills,
    summary
  )
  values (
    '00000000-0000-4000-8000-000000000301',
    seed_user_id,
    '00000000-0000-4000-8000-000000000101',
    'Software Engineer',
    'Lisboa',
    'hybrid',
    'Sem termo',
    35000,
    45000,
    array['TypeScript', 'React', 'PostgreSQL'],
    'Vaga de demonstração para testar relações e formulários.'
  )
  on conflict (id) do nothing;

  insert into public.applications (
    id,
    user_id,
    opportunity_id,
    primary_recruiter_id,
    status,
    application_date,
    source,
    next_action_summary,
    follow_up_date,
    interview_preparation,
    questions_for_company
  )
  values (
    '00000000-0000-4000-8000-000000000401',
    seed_user_id,
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000201',
    'interview_scheduled',
    current_date - 5,
    'LinkedIn',
    'Preparar a entrevista técnica',
    current_date + 2,
    'Rever projetos relevantes e preparar uma apresentação de dois minutos.',
    'Como é feito o acompanhamento dos primeiros 90 dias?'
  )
  on conflict (id) do nothing;

  insert into public.interviews (
    id,
    user_id,
    application_id,
    interview_type,
    scheduled_at,
    location_or_url,
    participants,
    preparation
  )
  values (
    '00000000-0000-4000-8000-000000000501',
    seed_user_id,
    '00000000-0000-4000-8000-000000000401',
    'Entrevista técnica',
    now() + interval '2 days',
    'https://meet.example.com/demo',
    array['Tech Lead'],
    'Rever arquitetura, testes e decisões dos projetos recentes.'
  )
  on conflict (id) do nothing;

  insert into public.notes (id, user_id, application_id, content)
  values (
    '00000000-0000-4000-8000-000000000601',
    seed_user_id,
    '00000000-0000-4000-8000-000000000401',
    'A equipa valoriza autonomia, comunicação e experiência com TypeScript.'
  )
  on conflict (id) do nothing;

  insert into public.actions (
    id,
    user_id,
    application_id,
    description,
    due_date,
    status,
    priority
  )
  values (
    '00000000-0000-4000-8000-000000000701',
    seed_user_id,
    '00000000-0000-4000-8000-000000000401',
    'Preparar exemplos de projetos para a entrevista',
    current_date + 1,
    'pending',
    'high'
  )
  on conflict (id) do nothing;
end;
$$;
