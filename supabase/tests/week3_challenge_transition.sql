-- Run after both Week 3 challenge migrations in the shared rollback test.
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
set local role authenticated;

do $$
declare
  single_id text;
  counter_id text;
  counter_target integer;
  result public.challenge_progress;
begin
  select id into single_id from public.track_challenges
  where type = 'single' and active = true order by id limit 1;
  select id, target into counter_id, counter_target
  from public.track_challenges
  where type = 'counter' and active = true and target > 1
  order by id limit 1;
  if single_id is null or counter_id is null then
    raise exception 'seed requires an active single and counter challenge';
  end if;

  select * into result from public.transition_challenge(single_id, 'toggle', 'first note', '2026-W40');
  if result.status <> 'complete' or result.count <> 1 or result.completed_at is null then
    raise exception 'single challenge did not complete';
  end if;
  if (select count(*) from public.activity
      where challenge_id = single_id and user_id = auth.uid()) <> 1 then
    raise exception 'single completion did not create one linked activity';
  end if;

  select * into result from public.transition_challenge(single_id, 'note', 'updated note', '2026-W40');
  if result.note <> 'updated note' or
     (select count(*) from public.activity
      where challenge_id = single_id and user_id = auth.uid()) <> 1 then
    raise exception 'note update duplicated or lost completion';
  end if;

  select * into result from public.transition_challenge(single_id, 'toggle', 'updated note', '2026-W40');
  if result.status <> 'not_started' or result.completed_at is not null or
     exists (select 1 from public.activity
             where challenge_id = single_id and user_id = auth.uid()) then
    raise exception 'single untick did not remove exact linked activity';
  end if;

  for i in 1..counter_target loop
    select * into result from public.transition_challenge(counter_id, 'increment', null, '2026-W40');
  end loop;
  if result.status <> 'complete' or result.count <> counter_target or
     (select count(*) from public.activity
      where challenge_id = counter_id and user_id = auth.uid()) <> 1 then
    raise exception 'counter did not complete exactly once at target';
  end if;

  select * into result from public.transition_challenge(counter_id, 'increment', null, '2026-W40');
  if result.count <> counter_target or
     (select count(*) from public.activity
      where challenge_id = counter_id and user_id = auth.uid()) <> 1 then
    raise exception 'counter increment crossed target or duplicated history';
  end if;

  select * into result from public.transition_challenge(counter_id, 'decrement', null, '2026-W40');
  if result.status <> 'not_started' or result.count <> counter_target - 1 or
     exists (select 1 from public.activity
             where challenge_id = counter_id and user_id = auth.uid()) then
    raise exception 'counter decrement did not reopen/remove activity';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);

do $$
begin
  begin
    perform public.transition_challenge(
      (select id from public.track_challenges order by id limit 1),
      'toggle', null, '2026-W40'
    );
    raise exception 'free account changed challenge progress';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
