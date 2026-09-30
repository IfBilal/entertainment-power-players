-- Expand-only billing state. Existing preview access is intentionally left
-- untouched until stores, webhook, and migration history have been validated.
-- The cutover that disables preview and derives is_pro() from this table must
-- be a separate, explicit release step.
create table public.subscription_status (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan text check (plan in ('monthly', 'annual')),
  product_id text,
  platform text check (platform in ('apple', 'google')),
  environment text check (environment in ('SANDBOX', 'PRODUCTION')),
  state text not null default 'free' check (state in ('free', 'trial', 'active', 'cancelled', 'expired')),
  active_until timestamptz,
  will_renew boolean,
  original_transaction_id text,
  last_reconciled_at timestamptz not null default now(),
  last_event_id text,
  updated_at timestamptz not null default now(),
  constraint subscription_status_paid_period_check check (
    state not in ('trial', 'active', 'cancelled') or active_until is not null
  )
);

create index subscription_status_active_until_idx
  on public.subscription_status (active_until)
  where state in ('trial', 'active', 'cancelled');

alter table public.subscription_status enable row level security;
create policy subscription_status_owner_read on public.subscription_status
  for select to authenticated using ((select auth.uid()) = user_id);
revoke all on public.subscription_status from public, anon, authenticated;
grant select on public.subscription_status to authenticated;
grant all on public.subscription_status to service_role;

create table public.billing_event_receipts (
  event_id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  event_type text not null,
  event_occurred_at timestamptz not null,
  processed_at timestamptz not null default now()
);
create index billing_event_receipts_user_time_idx
  on public.billing_event_receipts (user_id, event_occurred_at desc);
alter table public.billing_event_receipts enable row level security;
revoke all on public.billing_event_receipts from public, anon, authenticated;
grant all on public.billing_event_receipts to service_role;

-- Service role only. The Edge Function obtains the authoritative RevenueCat
-- subscriber snapshot and calls this in one transaction. Replays are ignored;
-- a delayed snapshot cannot overwrite a newer one for the same subscriber.
create function public.apply_billing_snapshot(
  p_event_id text,
  p_event_type text,
  p_event_occurred_at timestamptz,
  p_user_id uuid,
  p_plan text,
  p_product_id text,
  p_platform text,
  p_environment text,
  p_state text,
  p_active_until timestamptz,
  p_will_renew boolean,
  p_original_transaction_id text,
  p_snapshot_at timestamptz
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_inserted integer;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'Service role required' using errcode = '42501';
  end if;
  if p_event_id is null or length(p_event_id) = 0 or p_user_id is null
     or p_event_occurred_at is null or p_snapshot_at is null then
    raise exception 'Missing billing identity or timestamp' using errcode = '22023';
  end if;

  insert into public.billing_event_receipts (event_id, user_id, event_type, event_occurred_at)
  values (p_event_id, p_user_id, p_event_type, p_event_occurred_at)
  on conflict (event_id) do nothing;
  get diagnostics v_inserted = row_count;
  if v_inserted = 0 then
    return false;
  end if;

  insert into public.subscription_status as current (
    user_id, plan, product_id, platform, environment, state, active_until,
    will_renew, original_transaction_id, last_reconciled_at, last_event_id
  ) values (
    p_user_id, p_plan, p_product_id, p_platform, p_environment, p_state,
    p_active_until, p_will_renew, p_original_transaction_id, p_snapshot_at, p_event_id
  )
  on conflict (user_id) do update set
    plan = excluded.plan,
    product_id = excluded.product_id,
    platform = excluded.platform,
    environment = excluded.environment,
    state = excluded.state,
    active_until = excluded.active_until,
    will_renew = excluded.will_renew,
    original_transaction_id = excluded.original_transaction_id,
    last_reconciled_at = excluded.last_reconciled_at,
    last_event_id = excluded.last_event_id,
    updated_at = now()
  where excluded.last_reconciled_at >= current.last_reconciled_at;

  return found;
end;
$$;

revoke all on function public.apply_billing_snapshot(
  text, text, timestamptz, uuid, text, text, text, text, text,
  timestamptz, boolean, text, timestamptz
) from public, anon, authenticated;
grant execute on function public.apply_billing_snapshot(
  text, text, timestamptz, uuid, text, text, text, text, text,
  timestamptz, boolean, text, timestamptz
) to service_role;

create table public.billing_reconcile_limits (
  user_id uuid primary key references auth.users (id) on delete cascade,
  last_requested_at timestamptz not null
);
alter table public.billing_reconcile_limits enable row level security;
revoke all on public.billing_reconcile_limits from public, anon, authenticated;
grant all on public.billing_reconcile_limits to service_role;

create function public.claim_billing_reconcile()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  insert into public.billing_reconcile_limits (user_id, last_requested_at)
  values (v_user_id, now())
  on conflict (user_id) do update set last_requested_at = excluded.last_requested_at
  where public.billing_reconcile_limits.last_requested_at < now() - interval '30 seconds';
  return found;
end;
$$;
revoke all on function public.claim_billing_reconcile() from public, anon;
grant execute on function public.claim_billing_reconcile() to authenticated;
