-- Run inside a rollback transaction after Week 3 migrations and fixtures.
reset role;
select set_config('request.jwt.claim.role', 'service_role', true);
set local role service_role;

do $$
declare
  applied boolean;
begin
  applied := public.apply_billing_snapshot(
    'rc-event-1', 'INITIAL_PURCHASE', '2026-09-30 10:00+00',
    '30000000-0000-0000-0000-000000000001', 'monthly', 'epp_monthly',
    'google', 'SANDBOX', 'active', '2026-10-30 10:00+00', true,
    'lineage-1', '2026-09-30 10:01+00'
  );
  if not applied then raise exception 'first billing snapshot was not applied'; end if;

  applied := public.apply_billing_snapshot(
    'rc-event-1', 'INITIAL_PURCHASE', '2026-09-30 10:00+00',
    '30000000-0000-0000-0000-000000000001', 'monthly', 'epp_monthly',
    'google', 'SANDBOX', 'expired', null, false,
    'lineage-1', '2026-10-30 10:01+00'
  );
  if applied then raise exception 'duplicate billing event was applied'; end if;

  applied := public.apply_billing_snapshot(
    'rc-event-2', 'CANCELLATION', '2026-09-30 11:00+00',
    '30000000-0000-0000-0000-000000000001', 'monthly', 'epp_monthly',
    'google', 'SANDBOX', 'cancelled', '2026-10-30 10:00+00', false,
    'lineage-1', '2026-09-30 11:01+00'
  );
  if not applied then raise exception 'cancellation snapshot was not applied'; end if;

  applied := public.apply_billing_snapshot(
    'rc-event-3', 'RENEWAL', '2026-09-30 09:00+00',
    '30000000-0000-0000-0000-000000000001', 'monthly', 'epp_monthly',
    'google', 'SANDBOX', 'active', '2026-11-30 10:00+00', true,
    'lineage-1', '2026-09-30 09:01+00'
  );
  if applied then raise exception 'older snapshot overwrote cancellation'; end if;
  if (select state from public.subscription_status where user_id = '30000000-0000-0000-0000-000000000001') <> 'cancelled' then
    raise exception 'subscription state regressed';
  end if;
  if (select count(*) from public.billing_event_receipts where user_id = '30000000-0000-0000-0000-000000000001') <> 3 then
    raise exception 'billing event receipts were not durable/idempotent';
  end if;
end;
$$;

reset role;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);
set local role authenticated;

do $$
begin
  if exists (select 1 from public.subscription_status) then
    raise exception 'other user read subscription status';
  end if;
  begin
    update public.subscription_status set state = 'active'
    where user_id = '30000000-0000-0000-0000-000000000001';
    raise exception 'client updated server-owned subscription';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.apply_billing_snapshot(
      'forged', 'INITIAL_PURCHASE', now(),
      '30000000-0000-0000-0000-000000000002', 'annual', 'epp_annual',
      'google', 'SANDBOX', 'active', now() + interval '1 year', true,
      'lineage-forged', now()
    );
    raise exception 'client invoked service-only billing function';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
do $$
begin
  if (select state from public.subscription_status) <> 'cancelled' then
    raise exception 'owner could not read own subscription';
  end if;
  if not public.claim_billing_reconcile() then
    raise exception 'first reconciliation request was not accepted';
  end if;
  if public.claim_billing_reconcile() then
    raise exception 'reconciliation rate limit did not hold';
  end if;
end;
$$;
