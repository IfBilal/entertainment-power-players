-- Run inside the same transaction after week3_content_foundation.sql.
do $$
declare
  expected_id text;
  actual_id text;
begin
  select challenge.id into expected_id
  from public.track_challenges as challenge
  join public.challenge_progress as progress
    on progress.track_slug = challenge.track_slug
   and progress.challenge_order = challenge."order"
  where progress.user_id = '30000000-0000-0000-0000-000000000001';

  select challenge_id into actual_id
  from public.challenge_progress
  where user_id = '30000000-0000-0000-0000-000000000001';

  if actual_id is distinct from expected_id then
    raise exception 'legacy progress did not backfill stable challenge ID';
  end if;
  if (select count(*) from public.activity
      where user_id = '30000000-0000-0000-0000-000000000001'
        and type = 'challenge' and challenge_id = expected_id
        and week_key = '2026-W40') <> 1 then
    raise exception 'legacy completion did not create exactly one durable activity';
  end if;
end;
$$;

-- Deactivation is non-destructive: progress and its linked activity survive.
update public.track_challenges set active = false
where id = (
  select challenge_id from public.challenge_progress
  where user_id = '30000000-0000-0000-0000-000000000001'
);

do $$
begin
  if (select count(*) from public.challenge_progress
      where user_id = '30000000-0000-0000-0000-000000000001') <> 1 then
    raise exception 'deactivation erased progress';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
set local role authenticated;

insert into public.quote_favorites (user_id, quote_id)
select '30000000-0000-0000-0000-000000000001', id
from public.quotes order by id limit 1;

do $$
begin
  if (select count(*) from public.quote_favorites) <> 1 then
    raise exception 'owner could not read own quote favorite';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);

do $$
begin
  if exists (select 1 from public.quote_favorites) then
    raise exception 'another user could read quote favorite';
  end if;

  begin
    insert into public.quote_favorites (user_id, quote_id)
    select '30000000-0000-0000-0000-000000000001', id
    from public.quotes order by id desc limit 1;
    raise exception 'another user wrote the owner favorite';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
