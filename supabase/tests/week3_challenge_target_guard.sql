-- Run after the stable-ID cutover. The reject-only guard was replaced by an
-- atomic progress/activity reconciliation trigger and an admin-only RPC.
reset role;
do $$
begin
  if to_regprocedure('public.guard_challenge_configuration_change()') is not null then
    raise exception 'obsolete reject-only challenge guard is still installed';
  end if;
  if not exists (
    select 1 from pg_trigger
    where tgrelid = 'public.track_challenges'::regclass
      and tgname = 'reconcile_challenge_progress_on_config_change'
      and not tgisinternal
  ) then
    raise exception 'progress reconciliation trigger is missing';
  end if;
  if to_regprocedure('public.update_challenge_configuration(text,text,text,text,integer)') is null then
    raise exception 'admin challenge configuration RPC is missing';
  end if;
end;
$$;
