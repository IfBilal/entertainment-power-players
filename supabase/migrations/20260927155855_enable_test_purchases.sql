-- Temporary, reversible purchase simulation for internal testing before the
-- RevenueCat integration exists. Keep it separate from paid entitlements.
alter table public.app_config
  add column test_purchases_enabled boolean not null default false;

alter table public.profile_entitlements
  add column test_pro boolean not null default false,
  add column test_plan text,
  add constraint profile_entitlements_test_plan_check
    check (test_plan is null or test_plan in ('monthly', 'annual'));

-- Enabled only for this pre-billing test project. Turning this flag off
-- immediately revokes all test-only access without altering real is_pro rows.
update public.app_config
set test_purchases_enabled = true
where id = true;

create or replace function public.is_pro()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((
    select ent.is_pro or (
      ent.test_pro
      and coalesce((
        select config.test_purchases_enabled
        from public.app_config as config
        where config.id = true
      ), false)
    )
    from public.profile_entitlements as ent
    where ent.user_id = (select auth.uid())
  ), false);
$$;

create or replace function public.activate_preview_plan(p_plan text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
begin
  if caller_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if p_plan not in ('monthly', 'annual') then
    raise exception 'Unsupported plan' using errcode = '22023';
  end if;

  if not exists (
    select 1 from public.app_config
    where id = true and test_purchases_enabled = true
  ) then
    raise exception 'Test purchases are disabled' using errcode = '55000';
  end if;

  update public.profile_entitlements
  set test_pro = true, test_plan = p_plan
  where user_id = caller_id;

  if not found then
    raise exception 'Entitlement record not found' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.activate_preview_plan(text) from public, anon;
grant execute on function public.activate_preview_plan(text) to authenticated;
