-- Run inside a rollback transaction after week3_paid_entitlement.sql body.
reset role;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
set local role authenticated;
do $$
begin
  if not public.is_pro() then raise exception 'cancelled paid period lost access early'; end if;
  begin
    perform public.activate_preview_plan('annual');
    raise exception 'preview plan remained callable';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
update public.subscription_status set active_until = '2026-09-01 00:00+00'
where user_id = '30000000-0000-0000-0000-000000000001';
set local role authenticated;
do $$
begin
  if public.is_pro() then raise exception 'expired paid period still grants access'; end if;
end;
$$;
