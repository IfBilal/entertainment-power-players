-- Fix: get_daily_quote's own OUT parameters (local_date, quote_id) share
-- names with daily_quote_assignments columns, so the unqualified
-- `on conflict (user_id, local_date)` inside the function body was
-- ambiguous between the OUT variable and the table column. Rename the OUT
-- columns so they can never collide with a column PL/pgSQL also sees.

-- The OUT parameter list changed, so Postgres requires a drop before the
-- replace; this was run as two statements against the live project.
drop function if exists public.get_daily_quote(text);

create or replace function public.get_daily_quote(p_timezone text default null)
returns table (assigned_quote_id text, assigned_text text, assigned_author text, assigned_local_date date, assigned_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_tz text;
  v_local_date date;
  v_candidate record;
  v_pool_size integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext(v_uid::text));

  v_tz := coalesce(
    nullif(p_timezone, ''),
    (select p.timezone from public.profiles p where p.id = v_uid),
    'UTC'
  );
  if not exists (select 1 from pg_timezone_names where name = v_tz) then
    v_tz := 'UTC';
  end if;

  v_local_date := (now() at time zone v_tz)::date;

  return query
    select a.quote_id, a.text_snapshot, a.author_snapshot, a.local_date, a.assigned_at
    from public.daily_quote_assignments a
    where a.user_id = v_uid and a.local_date = v_local_date;
  if found then
    return;
  end if;

  select q.id, q.text, q.author into v_candidate
  from public.quotes q
  where q.active
    and q.id not in (
      select a.quote_id from public.daily_quote_assignments a
      where a.user_id = v_uid
        and a.local_date >= v_local_date - 224
        and a.local_date < v_local_date
    )
  order by md5(q.id || v_uid::text)
  limit 1;

  if v_candidate.id is null then
    select count(*) into v_pool_size from public.quotes where active;
    raise exception 'insufficient_quote_pool active_quotes=%', v_pool_size using errcode = 'P0001';
  end if;

  insert into public.daily_quote_assignments (user_id, local_date, quote_id, timezone, text_snapshot, author_snapshot)
  values (v_uid, v_local_date, v_candidate.id, v_tz, v_candidate.text, v_candidate.author)
  on conflict (user_id, local_date) do nothing;

  return query
    select a.quote_id, a.text_snapshot, a.author_snapshot, a.local_date, a.assigned_at
    from public.daily_quote_assignments a
    where a.user_id = v_uid and a.local_date = v_local_date;
end;
$$;

revoke all on function public.get_daily_quote(text) from public, anon;
grant execute on function public.get_daily_quote(text) to authenticated;
