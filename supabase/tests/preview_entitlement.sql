-- Verify a test purchase grants the caller only reversible, test-only access;
-- disabling the server switch immediately hides both contacts and challenges.
begin;

insert into auth.users (
  id,
  aud,
  role,
  email,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data
) values (
  '10000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'preview-entitlement-test@example.invalid',
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}'
);

select set_config('request.jwt.claim.sub', '10000000-0000-0000-0000-000000000001', true);
set local role authenticated;
select public.activate_preview_plan('monthly');

do $$
begin
  if not public.is_pro() then
    raise exception 'test purchase did not enable effective premium access';
  end if;
  if not exists (select 1 from public.contacts) then
    raise exception 'test premium account cannot read contacts through RLS';
  end if;
  if not exists (select 1 from public.track_challenges) then
    raise exception 'test premium account cannot read challenges through RLS';
  end if;
end;
$$;

reset role;
update public.app_config set test_purchases_enabled = false where id = true;
set local role authenticated;

do $$
begin
  if public.is_pro() then
    raise exception 'disabling test purchases did not revoke test-only access';
  end if;
  if exists (select 1 from public.contacts) then
    raise exception 'contacts remained visible after test access was disabled';
  end if;
  if exists (select 1 from public.track_challenges) then
    raise exception 'challenges remained visible after test access was disabled';
  end if;
end;
$$;

rollback;
