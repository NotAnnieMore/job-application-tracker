begin;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Utilizador'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name)
select
  id,
  coalesce(
    nullif(btrim(raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(coalesce(email, ''), '@', 1), ''),
    'Utilizador'
  )
from auth.users
on conflict (id) do nothing;

revoke insert, delete on table public.profiles from authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy companies_select_own
on public.companies
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy companies_insert_own
on public.companies
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy companies_update_own
on public.companies
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy companies_delete_own
on public.companies
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy recruiters_select_own
on public.recruiters
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy recruiters_insert_own
on public.recruiters
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy recruiters_update_own
on public.recruiters
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy recruiters_delete_own
on public.recruiters
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy opportunities_select_own
on public.opportunities
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy opportunities_insert_own
on public.opportunities
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy opportunities_update_own
on public.opportunities
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy opportunities_delete_own
on public.opportunities
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy applications_select_own
on public.applications
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy applications_insert_own
on public.applications
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy applications_update_own
on public.applications
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy applications_delete_own
on public.applications
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy interviews_select_own
on public.interviews
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy interviews_insert_own
on public.interviews
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy interviews_update_own
on public.interviews
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy interviews_delete_own
on public.interviews
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy notes_select_own
on public.notes
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy notes_insert_own
on public.notes
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy notes_update_own
on public.notes
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy notes_delete_own
on public.notes
for delete
to authenticated
using ((select auth.uid()) = user_id);

create policy actions_select_own
on public.actions
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy actions_insert_own
on public.actions
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy actions_update_own
on public.actions
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy actions_delete_own
on public.actions
for delete
to authenticated
using ((select auth.uid()) = user_id);

commit;
