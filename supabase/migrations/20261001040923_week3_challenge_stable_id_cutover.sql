-- Complete the stable-ID write cutover. Keep legacy position columns as
-- read-only compatibility data, but remove their identity/uniqueness role.
-- The reorder gate stays closed until the ID-based mobile release is deployed.

do $$
begin
  if exists (select 1 from public.challenge_progress where challenge_id is null) then
    raise exception 'Cannot cut over challenge progress: challenge_id backfill is incomplete';
  end if;
  if exists (
    select 1 from public.challenge_progress
    group by user_id, challenge_id
    having count(*) > 1
  ) then
    raise exception 'Cannot cut over challenge progress: duplicate user/challenge rows exist';
  end if;
end;
$$;

alter table public.challenge_progress alter column challenge_id set not null;
drop index public.challenge_progress_user_challenge_uidx;
alter table public.challenge_progress drop constraint challenge_progress_pkey;
alter table public.challenge_progress
  add constraint challenge_progress_pkey primary key (user_id, challenge_id);

-- Keep order-based fields readable for old builds, but prohibit direct client
-- writes. New builds must use the authenticated, owner-bound RPC below.
revoke insert, update, delete on public.challenge_progress from public, anon, authenticated;
grant select on public.challenge_progress to authenticated;

-- Restrict direct type/target changes to the reconciliation RPC. Existing
-- title/description/active edits and the reorder RPC retain their column grants.
revoke update on public.track_challenges from public, anon, authenticated;
grant update (title, description, active, "order") on public.track_challenges to authenticated;

create or replace function public.update_challenge_configuration(
  p_challenge_id text,
  p_title text,
  p_description text,
  p_type text,
  p_target integer
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or not (select public.is_admin()) then
    raise exception 'Admin required' using errcode = '42501';
  end if;
  if p_challenge_id is null or nullif(btrim(p_title), '') is null then
    raise exception 'Challenge ID and title are required' using errcode = '22023';
  end if;
  if p_type is null or p_type not in ('single', 'counter')
     or (p_type = 'counter' and coalesce(p_target, 0) < 1)
     or (p_type = 'single' and p_target is not null) then
    raise exception 'Invalid challenge type or target' using errcode = '22023';
  end if;

  update public.track_challenges
  set title = btrim(p_title),
      description = coalesce(p_description, ''),
      type = p_type,
      target = p_target
  where id = p_challenge_id;
  if not found then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;
end;
$$;
revoke all on function public.update_challenge_configuration(text, text, text, text, integer)
  from public, anon;
grant execute on function public.update_challenge_configuration(text, text, text, text, integer)
  to authenticated;

drop trigger guard_challenge_configuration_change on public.track_challenges;
drop function public.guard_challenge_configuration_change();

-- Target/type edits preserve each member's row and note. Counter counts clamp
-- to [0,target]; single progress maps any nonzero count/completion to 1.
-- Completion is recalculated, with its linked history row maintained atomically.
-- A newly materialized completion uses UTC because the admin has no member
-- timezone; existing completion date/week remain unchanged.
create function public.reconcile_challenge_progress_on_config_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_progress public.challenge_progress%rowtype;
  v_activity public.activity%rowtype;
  v_count integer;
  v_complete boolean;
  v_was_complete boolean;
  v_completed_at timestamptz;
begin
  if old.type is not distinct from new.type and old.target is not distinct from new.target then
    return new;
  end if;
  if new.type is null or new.type not in ('single', 'counter')
     or (new.type = 'counter' and coalesce(new.target, 0) < 1)
     or (new.type = 'single' and new.target is not null) then
    raise exception 'Invalid challenge type or target' using errcode = '23514';
  end if;

  for v_progress in
    select * from public.challenge_progress
    where challenge_id = new.id
    for update
  loop
    v_was_complete := v_progress.status = 'complete';
    if new.type = 'single' then
      v_count := case when v_was_complete or v_progress.count > 0 then 1 else 0 end;
      v_complete := v_count = 1;
    else
      v_count := least(greatest(v_progress.count, 0), new.target);
      v_complete := v_count = new.target;
    end if;

    v_completed_at := case
      when not v_complete then null
      when v_was_complete then coalesce(v_progress.completed_at, now())
      else now()
    end;

    update public.challenge_progress
    set status = case when v_complete then 'complete' else 'not_started' end,
        count = v_count,
        completed_at = v_completed_at
    where user_id = v_progress.user_id and challenge_id = new.id;

    if v_complete then
      select * into v_activity
      from public.activity
      where user_id = v_progress.user_id and challenge_id = new.id and type = 'challenge'
      for update;
      if found then
        if v_was_complete then
          update public.activity set notes = v_progress.note where id = v_activity.id;
        else
          update public.activity
          set title = 'Completed "' || new.title || '"',
              date = v_completed_at,
              week_key = to_char(v_completed_at at time zone 'UTC', 'IYYY-"W"IW'),
              notes = v_progress.note
          where id = v_activity.id;
        end if;
      else
        insert into public.activity (user_id, type, title, challenge_id, date, week_key, notes)
        values (
          v_progress.user_id,
          'challenge',
          'Completed "' || new.title || '"',
          new.id,
          v_completed_at,
          to_char(v_completed_at at time zone 'UTC', 'IYYY-"W"IW'),
          v_progress.note
        )
        on conflict (user_id, challenge_id)
          where type = 'challenge' and challenge_id is not null
        do update set notes = excluded.notes;
      end if;
    else
      delete from public.activity
      where user_id = v_progress.user_id and challenge_id = new.id and type = 'challenge';
    end if;
  end loop;
  return new;
end;
$$;
revoke all on function public.reconcile_challenge_progress_on_config_change()
  from public, anon, authenticated;
create trigger reconcile_challenge_progress_on_config_change
after update of type, target on public.track_challenges
for each row execute function public.reconcile_challenge_progress_on_config_change();

update public.app_config set challenge_reorder_enabled = false where id = true;

create or replace function public.transition_challenge(
  p_challenge_id text,
  p_action text,
  p_note text,
  p_week_key text
)
returns public.challenge_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_track_slug text;
  v_challenge public.track_challenges%rowtype;
  v_progress public.challenge_progress%rowtype;
  v_count integer;
  v_complete boolean;
  v_was_complete boolean;
  v_completed_at timestamptz;
  v_note text;
begin
  if v_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not (select public.is_pro()) then
    raise exception 'Premium required' using errcode = '42501';
  end if;
  if p_action is null or p_action not in ('toggle', 'increment', 'decrement', 'note') then
    raise exception 'Unsupported challenge action' using errcode = '22023';
  end if;
  if p_week_key is null or p_week_key !~ '^[0-9]{4}-W(0[1-9]|[1-4][0-9]|5[0-3])$' then
    raise exception 'Invalid ISO week key' using errcode = '22023';
  end if;
  if length(p_note) > 500 then
    raise exception 'Challenge note is too long' using errcode = '22023';
  end if;

  select track_slug into v_track_slug
  from public.track_challenges
  where id = p_challenge_id and active = true;
  if not found then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;
  -- Match reorder's track-first lock order so the legacy display coordinates
  -- written alongside each stable ID cannot be stale after a concurrent move.
  perform 1 from public.tracks where slug = v_track_slug for key share;
  if not found then
    raise exception 'Track not found' using errcode = 'P0002';
  end if;
  select * into v_challenge
  from public.track_challenges
  where id = p_challenge_id and active = true
  for share;
  if not found then
    raise exception 'Challenge not found' using errcode = 'P0002';
  end if;
  if (v_challenge.type = 'single' and p_action in ('increment', 'decrement'))
     or (v_challenge.type = 'counter' and p_action = 'toggle') then
    raise exception 'Action does not match challenge type' using errcode = '22023';
  end if;
  if v_challenge.type = 'counter' and coalesce(v_challenge.target, 0) < 1 then
    raise exception 'Counter target must be positive' using errcode = '22023';
  end if;

  insert into public.challenge_progress (
    user_id, track_slug, challenge_order, challenge_id,
    status, count, completed_at, note
  ) values (
    v_user_id, v_challenge.track_slug, v_challenge."order", v_challenge.id,
    'not_started', 0, null, null
  )
  on conflict (user_id, challenge_id) do nothing;

  select * into v_progress
  from public.challenge_progress
  where user_id = v_user_id and challenge_id = v_challenge.id
  for update;
  if not found then
    raise exception 'Challenge progress could not be initialized' using errcode = '23503';
  end if;

  v_was_complete := v_progress.status = 'complete';
  v_note := nullif(btrim(p_note), '');
  if v_challenge.type = 'single' then
    v_count := case
      when p_action = 'toggle' and v_was_complete then 0
      when p_action = 'toggle' then 1
      else v_progress.count
    end;
    v_complete := v_count = 1;
  else
    v_count := least(greatest(v_progress.count, 0), v_challenge.target);
    v_count := case p_action
      when 'increment' then least(v_count + 1, v_challenge.target)
      when 'decrement' then greatest(v_count - 1, 0)
      else v_count
    end;
    v_complete := v_count = v_challenge.target;
  end if;
  v_completed_at := case
    when not v_complete then null
    when v_was_complete then v_progress.completed_at
    else now()
  end;

  update public.challenge_progress
  set track_slug = v_challenge.track_slug,
      challenge_order = v_challenge."order",
      status = case when v_complete then 'complete' else 'not_started' end,
      count = v_count,
      completed_at = v_completed_at,
      note = v_note
  where user_id = v_user_id and challenge_id = v_challenge.id
  returning * into v_progress;

  if v_complete and not v_was_complete then
    insert into public.activity (
      user_id, type, title, challenge_id, date, week_key, notes
    ) values (
      v_user_id, 'challenge', 'Completed "' || v_challenge.title || '"',
      v_challenge.id, v_completed_at, p_week_key, v_note
    )
    on conflict (user_id, challenge_id)
      where type = 'challenge' and challenge_id is not null
    do update set title = excluded.title,
                  date = excluded.date,
                  week_key = excluded.week_key,
                  notes = excluded.notes;
  elsif not v_complete and v_was_complete then
    delete from public.activity
    where user_id = v_user_id and challenge_id = v_challenge.id and type = 'challenge';
  elsif v_complete and p_action = 'note' then
    update public.activity set notes = v_note
    where user_id = v_user_id and challenge_id = v_challenge.id and type = 'challenge';
  end if;
  return v_progress;
end;
$$;
revoke all on function public.transition_challenge(text, text, text, text)
  from public, anon;
grant execute on function public.transition_challenge(text, text, text, text)
  to authenticated;

-- Stable IDs remain the only progress identity. Keep the deprecated position
-- columns synchronized for read-only older clients while the reorder gate is
-- closed; old clients cannot write progress directly after this migration.
create or replace function public.reorder_track_challenges(
  p_track_slug text,
  p_challenge_ids text[]
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
  v_base integer;
begin
  if auth.uid() is null or not (select public.is_admin()) then
    raise exception 'Admin required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.app_config
    where id = true and challenge_reorder_enabled = true
  ) then
    raise exception 'Challenge reorder is disabled until the app cutover'
      using errcode = '55000';
  end if;
  if p_track_slug is null or p_challenge_ids is null then
    raise exception 'Track and complete challenge ID list required' using errcode = '22023';
  end if;

  perform 1 from public.tracks where slug = p_track_slug for update;
  if not found then
    raise exception 'Track not found' using errcode = 'P0002';
  end if;
  select count(*), greatest(coalesce(max("order"), 0), 0)
  into v_count, v_base
  from public.track_challenges where track_slug = p_track_slug;

  if cardinality(p_challenge_ids) <> v_count
     or (select count(distinct id) from unnest(p_challenge_ids) as id) <> v_count
     or exists (
       select 1 from unnest(p_challenge_ids) as requested(id)
       left join public.track_challenges as challenge
         on challenge.id = requested.id and challenge.track_slug = p_track_slug
       where challenge.id is null
     ) then
    raise exception 'Challenge reorder must contain each track challenge exactly once'
      using errcode = '22023';
  end if;
  if v_count > 0 and v_base > 2147483647 - v_count then
    raise exception 'Challenge order range is exhausted' using errcode = '22003';
  end if;

  update public.track_challenges as challenge
  set "order" = v_base + ord.position::integer
  from unnest(p_challenge_ids) with ordinality as ord(id, position)
  where challenge.id = ord.id and challenge.track_slug = p_track_slug;

  update public.track_challenges as challenge
  set "order" = ord.position::integer - 1
  from unnest(p_challenge_ids) with ordinality as ord(id, position)
  where challenge.id = ord.id and challenge.track_slug = p_track_slug;

  update public.challenge_progress as progress
  set track_slug = challenge.track_slug,
      challenge_order = challenge."order"
  from public.track_challenges as challenge
  where challenge.id = progress.challenge_id
    and challenge.track_slug = p_track_slug;
end;
$$;
revoke all on function public.reorder_track_challenges(text, text[])
  from public, anon;
grant execute on function public.reorder_track_challenges(text, text[])
  to authenticated;
