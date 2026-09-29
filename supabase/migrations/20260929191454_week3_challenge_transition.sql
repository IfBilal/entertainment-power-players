-- An authenticated caller changes only their own progress. SECURITY INVOKER
-- keeps existing challenge/progress/activity RLS in force. One function call
-- is a single Postgres transaction: progress and tracker history cannot split.
create function public.transition_challenge(
  p_challenge_id text,
  p_action text,
  p_note text,
  p_week_key text
)
returns public.challenge_progress
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
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

  select * into v_challenge
  from public.track_challenges
  where id = p_challenge_id and active = true;

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

  -- The legacy PK still exists for installed APKs. Insert-or-lock avoids a
  -- read/insert race; the unique challenge ID prevents a second logical row.
  insert into public.challenge_progress (
    user_id, track_slug, challenge_order, challenge_id,
    status, count, completed_at, note
  ) values (
    v_user_id, v_challenge.track_slug, v_challenge."order", v_challenge.id,
    'not_started', 0, null, null
  )
  on conflict (user_id, track_slug, challenge_order)
  do update set challenge_id = excluded.challenge_id
  where public.challenge_progress.challenge_id is null
     or public.challenge_progress.challenge_id = excluded.challenge_id;

  select * into v_progress
  from public.challenge_progress
  where user_id = v_user_id and challenge_id = v_challenge.id
  for update;
  if not found then
    raise exception 'Progress identity conflicts with reordered content' using errcode = '23505';
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
  set status = case when v_complete then 'complete' else 'not_started' end,
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
    where user_id = v_user_id and challenge_id = v_challenge.id
      and type = 'challenge';
  elsif v_complete and p_action = 'note' then
    update public.activity set notes = v_note
    where user_id = v_user_id and challenge_id = v_challenge.id
      and type = 'challenge';
  end if;

  return v_progress;
end;
$$;

revoke all on function public.transition_challenge(text, text, text, text)
  from public, anon;
grant execute on function public.transition_challenge(text, text, text, text)
  to authenticated;
