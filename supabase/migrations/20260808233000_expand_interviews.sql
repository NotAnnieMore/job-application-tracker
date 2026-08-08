begin;

create type public.interview_status as enum (
  'scheduled',
  'completed',
  'cancelled'
);

create type public.interview_format as enum (
  'video',
  'phone',
  'onsite',
  'other'
);

alter table public.interviews
  add column recruiter_id uuid,
  add column status public.interview_status not null default 'scheduled',
  add column format public.interview_format not null default 'video',
  add column duration_minutes smallint not null default 60,
  add constraint interviews_duration_valid
    check (duration_minutes between 5 and 480),
  add constraint interviews_recruiter_same_user
    foreign key (user_id, recruiter_id)
    references public.recruiters (user_id, id)
    on delete set null (recruiter_id);

create index interviews_user_status_scheduled_idx
  on public.interviews (user_id, status, scheduled_at);

comment on column public.interviews.recruiter_id is
  'Contacto principal opcional desta entrevista.';
comment on column public.interviews.status is
  'Estado operacional da entrevista: agendada, concluída ou cancelada.';
comment on column public.interviews.format is
  'Formato da entrevista: videochamada, telefone, presencial ou outro.';
comment on column public.interviews.duration_minutes is
  'Duração prevista da entrevista em minutos.';

commit;
