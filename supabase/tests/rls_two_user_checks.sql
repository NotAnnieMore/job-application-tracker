-- Teste de isolamento com duas contas reais.
-- Requer pelo menos duas contas em Authentication > Users.
-- Todos os registos de teste são revertidos no final.

begin;

do $$
declare
  test_users uuid[];
  probe_id uuid := gen_random_uuid();
begin
  select array_agg(id order by created_at)
  into test_users
  from (
    select id, created_at
    from auth.users
    order by created_at
    limit 2
  ) as first_two_users;

  if coalesce(array_length(test_users, 1), 0) < 2 then
    raise exception 'Cria e confirma duas contas antes de executar este teste.';
  end if;

  perform set_config('app.rls_test_user_a', test_users[1]::text, true);
  perform set_config('app.rls_test_user_b', test_users[2]::text, true);
  perform set_config('app.rls_test_probe_id', probe_id::text, true);

  insert into public.companies (id, user_id, name)
  values (probe_id, test_users[1], 'Teste temporário de isolamento RLS');
end;
$$;

select set_config(
  'request.jwt.claim.sub',
  current_setting('app.rls_test_user_a'),
  true
);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('app.rls_test_user_a'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

do $$
declare
  visible_rows integer;
begin
  select count(*)
  into visible_rows
  from public.companies
  where id = current_setting('app.rls_test_probe_id')::uuid;

  if visible_rows <> 1 then
    raise exception 'O utilizador A não conseguiu consultar o próprio registo.';
  end if;

  begin
    insert into public.companies (user_id, name)
    values (
      current_setting('app.rls_test_user_b')::uuid,
      'Inserção que deve ser bloqueada'
    );
    raise exception 'O utilizador A conseguiu criar um registo para o utilizador B.';
  exception
    when insufficient_privilege then null;
  end;

  raise notice 'Utilizador A: leitura própria permitida e propriedade alheia bloqueada.';
end;
$$;

reset role;

select set_config(
  'request.jwt.claim.sub',
  current_setting('app.rls_test_user_b'),
  true
);
select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', current_setting('app.rls_test_user_b'),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

do $$
declare
  affected_rows integer;
  visible_rows integer;
begin
  select count(*)
  into visible_rows
  from public.companies
  where id = current_setting('app.rls_test_probe_id')::uuid;

  if visible_rows <> 0 then
    raise exception 'O utilizador B conseguiu consultar o registo do utilizador A.';
  end if;

  update public.companies
  set name = 'Alteração que deve ser bloqueada'
  where id = current_setting('app.rls_test_probe_id')::uuid;
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'O utilizador B conseguiu editar o registo do utilizador A.';
  end if;

  delete from public.companies
  where id = current_setting('app.rls_test_probe_id')::uuid;
  get diagnostics affected_rows = row_count;

  if affected_rows <> 0 then
    raise exception 'O utilizador B conseguiu eliminar o registo do utilizador A.';
  end if;

  raise notice 'Utilizador B: leitura, edição e eliminação alheias bloqueadas.';
end;
$$;

reset role;

select 'RLS validado: os dados das duas contas estão isolados.' as resultado;

rollback;
