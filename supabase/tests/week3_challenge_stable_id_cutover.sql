-- Run inside the rollback-only Week 3 SQL integration transaction after the
-- progress fixtures and all Week 3 migrations, including the ID cutover.
reset role;
do $$
begin
  if (select pg_get_constraintdef(oid)
      from pg_constraint
      where conrelid = 'public.challenge_progress'::regclass and conname = 'challenge_progress_pkey')
     <> 'PRIMARY KEY (user_id, challenge_id)' then
    raise exception 'challenge progress primary key is not stable-ID based';
  end if;
  if exists (select 1 from public.challenge_progress where challenge_id is null) then
    raise exception 'stable challenge ID is nullable after cutover';
  end if;
  if (select challenge_reorder_enabled from public.app_config where id = true) then
    raise exception 'reorder gate opened before the ID-based app rollout';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
set local role authenticated;
do $$
begin
  begin
    update public.challenge_progress set note = 'legacy direct write'
    where user_id = auth.uid();
    raise exception 'direct challenge progress update unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.track_challenges set target = 99
    where id = (select challenge_id from public.challenge_progress where user_id = auth.uid() limit 1);
    raise exception 'direct type/target edit unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

do $$
declare
  v_challenge_id text;
  v_progress public.challenge_progress%rowtype;
  v_activity_count integer;
begin
  select progress.challenge_id into v_challenge_id
  from public.challenge_progress as progress
  join public.track_challenges as challenge on challenge.id = progress.challenge_id
  where progress.user_id = auth.uid() and challenge.type = 'single'
  order by progress.challenge_id limit 1;
  if v_challenge_id is null then raise exception 'single progress fixture required'; end if;

  begin
    perform public.update_challenge_configuration(v_challenge_id, 'Invalid type', '', null, null);
    raise exception 'null challenge type unexpectedly succeeded';
  exception when invalid_parameter_value then null;
  end;

  -- A completed single maps to count=1. Switching to a counter target of 2
  -- makes it incomplete and removes its exact linked activity.
  perform public.update_challenge_configuration(v_challenge_id, 'Configurable challenge', '', 'counter', 2);
  select * into v_progress from public.challenge_progress
  where user_id = auth.uid() and challenge_id = v_challenge_id;
  if v_progress.status <> 'not_started' or v_progress.count <> 1 or v_progress.note <> 'legacy completion'
     or v_progress.completed_at is not null then
    raise exception 'counter conversion did not preserve note and recompute progress';
  end if;
  if exists (select 1 from public.activity where user_id = auth.uid() and challenge_id = v_challenge_id and type = 'challenge') then
    raise exception 'incomplete progress retained a completion activity';
  end if;

  -- Lowering the target to the retained count completes it and adds exactly
  -- one linked activity. Raising the target removes that activity again.
  perform public.update_challenge_configuration(v_challenge_id, 'Configurable challenge', '', 'counter', 1);
  select * into v_progress from public.challenge_progress
  where user_id = auth.uid() and challenge_id = v_challenge_id;
  select count(*) into v_activity_count from public.activity
  where user_id = auth.uid() and challenge_id = v_challenge_id and type = 'challenge';
  if v_progress.status <> 'complete' or v_progress.completed_at is null or v_activity_count <> 1 then
    raise exception 'lowered target did not create one completion and activity';
  end if;

  perform public.update_challenge_configuration(v_challenge_id, 'Configurable challenge', '', 'counter', 3);
  select * into v_progress from public.challenge_progress
  where user_id = auth.uid() and challenge_id = v_challenge_id;
  if v_progress.status <> 'not_started' or v_progress.count <> 1 or v_progress.completed_at is not null
     or exists (select 1 from public.activity where user_id = auth.uid() and challenge_id = v_challenge_id and type = 'challenge') then
    raise exception 'increased target did not reopen progress and remove activity';
  end if;

  -- A nonzero counter converts to a completed single with one history row.
  perform public.update_challenge_configuration(v_challenge_id, 'Configurable challenge', '', 'single', null);
  select * into v_progress from public.challenge_progress
  where user_id = auth.uid() and challenge_id = v_challenge_id;
  select count(*) into v_activity_count from public.activity
  where user_id = auth.uid() and challenge_id = v_challenge_id and type = 'challenge';
  if v_progress.status <> 'complete' or v_progress.count <> 1 or v_activity_count <> 1 then
    raise exception 'counter-to-single conversion did not reconcile completion';
  end if;

  -- New app writes still succeed only through the stable-ID RPC.
  select * into v_progress from public.transition_challenge(v_challenge_id, 'toggle', null, '2026-W40');
  if v_progress.status <> 'not_started' or v_progress.challenge_id <> v_challenge_id then
    raise exception 'stable-ID transition did not toggle the same progress row';
  end if;
end;
$$;
