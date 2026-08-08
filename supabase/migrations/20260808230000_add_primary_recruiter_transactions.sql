begin;

drop function public.create_application_with_opportunity(
  uuid, text, text, public.work_mode, text, numeric, numeric, text, text,
  text[], text, public.application_status, date, text, numeric, text, text,
  date, text, text
);

drop function public.update_application_with_opportunity(
  uuid, uuid, text, text, public.work_mode, text, numeric, numeric, text, text,
  text[], text, public.application_status, date, text, numeric, text, text,
  date, text, text
);

create function public.create_application_with_opportunity(
  p_company_id uuid,
  p_primary_recruiter_id uuid,
  p_title text,
  p_location text,
  p_work_mode public.work_mode,
  p_employment_type text,
  p_salary_min numeric,
  p_salary_max numeric,
  p_currency text,
  p_job_url text,
  p_skills text[],
  p_opportunity_summary text,
  p_status public.application_status,
  p_application_date date,
  p_source text,
  p_expected_salary numeric,
  p_summary_notes text,
  p_next_action_summary text,
  p_follow_up_date date,
  p_interview_preparation text,
  p_questions_for_company text
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_opportunity_id uuid;
  v_application_id uuid;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  if p_primary_recruiter_id is not null and not exists (
    select 1
    from public.recruiters
    where id = p_primary_recruiter_id
      and user_id = v_user_id
      and (company_id is null or company_id = p_company_id)
  ) then
    raise check_violation using message = 'Recruiter is not available for this company';
  end if;

  insert into public.opportunities (
    user_id,
    company_id,
    title,
    location,
    work_mode,
    employment_type,
    salary_min,
    salary_max,
    currency,
    job_url,
    skills,
    summary
  )
  values (
    v_user_id,
    p_company_id,
    p_title,
    p_location,
    p_work_mode,
    p_employment_type,
    p_salary_min,
    p_salary_max,
    p_currency,
    p_job_url,
    coalesce(p_skills, '{}'),
    p_opportunity_summary
  )
  returning id into v_opportunity_id;

  insert into public.applications (
    user_id,
    opportunity_id,
    primary_recruiter_id,
    status,
    application_date,
    source,
    expected_salary,
    summary_notes,
    next_action_summary,
    follow_up_date,
    interview_preparation,
    questions_for_company
  )
  values (
    v_user_id,
    v_opportunity_id,
    p_primary_recruiter_id,
    p_status,
    p_application_date,
    p_source,
    p_expected_salary,
    p_summary_notes,
    p_next_action_summary,
    p_follow_up_date,
    p_interview_preparation,
    p_questions_for_company
  )
  returning id into v_application_id;

  return v_application_id;
end;
$$;

create function public.update_application_with_opportunity(
  p_application_id uuid,
  p_company_id uuid,
  p_primary_recruiter_id uuid,
  p_title text,
  p_location text,
  p_work_mode public.work_mode,
  p_employment_type text,
  p_salary_min numeric,
  p_salary_max numeric,
  p_currency text,
  p_job_url text,
  p_skills text[],
  p_opportunity_summary text,
  p_status public.application_status,
  p_application_date date,
  p_source text,
  p_expected_salary numeric,
  p_summary_notes text,
  p_next_action_summary text,
  p_follow_up_date date,
  p_interview_preparation text,
  p_questions_for_company text
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_opportunity_id uuid;
begin
  if v_user_id is null then
    raise insufficient_privilege using message = 'Authentication required';
  end if;

  if p_primary_recruiter_id is not null and not exists (
    select 1
    from public.recruiters
    where id = p_primary_recruiter_id
      and user_id = v_user_id
      and (company_id is null or company_id = p_company_id)
  ) then
    raise check_violation using message = 'Recruiter is not available for this company';
  end if;

  select opportunity_id
  into v_opportunity_id
  from public.applications
  where id = p_application_id
    and user_id = v_user_id
  for update;

  if not found then
    return false;
  end if;

  update public.opportunities
  set
    company_id = p_company_id,
    title = p_title,
    location = p_location,
    work_mode = p_work_mode,
    employment_type = p_employment_type,
    salary_min = p_salary_min,
    salary_max = p_salary_max,
    currency = p_currency,
    job_url = p_job_url,
    skills = coalesce(p_skills, '{}'),
    summary = p_opportunity_summary
  where id = v_opportunity_id
    and user_id = v_user_id;

  update public.applications
  set
    primary_recruiter_id = p_primary_recruiter_id,
    status = p_status,
    application_date = p_application_date,
    source = p_source,
    expected_salary = p_expected_salary,
    summary_notes = p_summary_notes,
    next_action_summary = p_next_action_summary,
    follow_up_date = p_follow_up_date,
    interview_preparation = p_interview_preparation,
    questions_for_company = p_questions_for_company
  where id = p_application_id
    and user_id = v_user_id;

  return true;
end;
$$;

revoke execute on function public.create_application_with_opportunity(
  uuid, uuid, text, text, public.work_mode, text, numeric, numeric, text, text,
  text[], text, public.application_status, date, text, numeric, text, text,
  date, text, text
) from public, anon;

revoke execute on function public.update_application_with_opportunity(
  uuid, uuid, uuid, text, text, public.work_mode, text, numeric, numeric, text,
  text, text[], text, public.application_status, date, text, numeric, text,
  text, date, text, text
) from public, anon;

grant execute on function public.create_application_with_opportunity(
  uuid, uuid, text, text, public.work_mode, text, numeric, numeric, text, text,
  text[], text, public.application_status, date, text, numeric, text, text,
  date, text, text
) to authenticated;

grant execute on function public.update_application_with_opportunity(
  uuid, uuid, uuid, text, text, public.work_mode, text, numeric, numeric, text,
  text, text[], text, public.application_status, date, text, numeric, text,
  text, date, text, text
) to authenticated;

commit;
