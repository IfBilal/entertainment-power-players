-- Phase 4 foundation: member timezone, quote import columns, and the
-- server-side 224-day daily quote rotation. No client quote content is
-- added here -- this only makes the schema ready to receive it later.

-- 1. Member timezone, used to decide each member's "today". Validated
--    against the server's own timezone database, not trusted blindly.
alter table public.profiles add column if not exists timezone text;

create or replace function public.validate_profile_timezone()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.timezone is not null and not exists (
    select 1 from pg_timezone_names where name = new.timezone
  ) then
    raise exception 'Unknown timezone: %', new.timezone using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_validate_timezone on public.profiles;
create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function public.validate_profile_timezone();

-- 2. Quote import columns (plan 7.2): optional category, source provenance,
--    timestamps, and a normalized fingerprint so re-imports can match
--    existing rows and exact duplicates are rejected regardless of
--    whitespace. `id` stays as-is; existing rows are untouched.
alter table public.quotes add column if not exists category_slug text references public.categories (slug) on update cascade;
alter table public.quotes add column if not exists source text;
alter table public.quotes add column if not exists created_at timestamptz not null default now();
alter table public.quotes add column if not exists updated_at timestamptz not null default now();
alter table public.quotes add column if not exists content_fingerprint text
  generated always as (lower(regexp_replace(btrim(text), '\s+', ' ', 'g')) || '|' || lower(btrim(author))) stored;

create unique index if not exists quotes_content_fingerprint_uidx on public.quotes (content_fingerprint);

drop trigger if exists quotes_touch_updated_at on public.quotes;
create trigger quotes_touch_updated_at
  before update on public.quotes
  for each row execute function public.touch_questions_updated_at();

-- 3. Daily rotation ledger. Server-created only; members may read their own
--    history. Snapshots keep a member's past assignment stable text/author
--    even if the quote is later edited or deactivated.
create table if not exists public.daily_quote_assignments (
  user_id uuid not null references auth.users (id) on delete cascade,
  local_date date not null,
  quote_id text not null references public.quotes (id),
  timezone text not null,
  assigned_at timestamptz not null default now(),
  text_snapshot text not null,
  author_snapshot text not null,
  primary key (user_id, local_date)
);

create index if not exists daily_quote_assignments_user_quote_idx
  on public.daily_quote_assignments (user_id, quote_id);

alter table public.daily_quote_assignments enable row level security;

create policy "daily_quote_assignments_owner_select" on public.daily_quote_assignments
  for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.daily_quote_assignments from anon, public;
grant select on public.daily_quote_assignments to authenticated;

-- 4. Allocation. Returns today's assignment for the caller, creating one if
-- needed. An advisory lock keyed to the caller serializes concurrent calls
-- from the same member (e.g. two app instances) so they get one answer.
create or replace function public.get_daily_quote(p_timezone text default null)
returns table (quote_id text, quote_text text, quote_author text, local_date date, assigned_at timestamptz)
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
