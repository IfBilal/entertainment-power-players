-- Run inside rollback transaction after progress fixtures and guard migration.
reset role;
do $$
declare
  target_challenge text;
begin
  select challenge_id into target_challenge
  from public.challenge_progress
  where user_id = '30000000-0000-0000-0000-000000000001'
  order by challenge_id limit 1;
  if target_challenge is null then raise exception 'No progress fixture for guard test'; end if;
  begin
    update public.track_challenges
    set target = coalesce(target, 1) + 1
    where id = target_challenge;
    raise exception 'Target changed despite existing progress';
  exception when check_violation then null;
  end;
  update public.track_challenges
  set title = title || ' edited'
  where id = target_challenge;
end;
$$;
