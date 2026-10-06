-- Email availability check for the profile "change email" flow.
--
-- A signed-in member asks whether a new address is already used by another
-- account before a verification email is sent. The check runs server-side
-- because clients cannot read auth.users. Each member is limited to a small
-- number of checks per hour, which makes it slow to map registered addresses.
--
-- Not applied to any project yet. Apply only after review.

create table if not exists public.email_availability_checks (
  user_id uuid not null references auth.users (id) on delete cascade,
  checked_at timestamptz not null default now()
);

create index if not exists email_availability_checks_user_recent
  on public.email_availability_checks (user_id, checked_at desc);

-- Server-only table: RLS on with no policies means no direct client access.
alter table public.email_availability_checks enable row level security;
revoke all on table public.email_availability_checks from anon, authenticated;

create or replace function public.email_is_available(candidate text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized text;
  recent_checks integer;
begin
  if auth.uid() is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  normalized := lower(btrim(coalesce(candidate, '')));
  if normalized = '' or position('@' in normalized) = 0 then
    raise exception 'invalid_email' using errcode = '22023';
  end if;

  select count(*)
    into recent_checks
    from public.email_availability_checks
   where user_id = auth.uid()
     and checked_at > now() - interval '1 hour';

  if recent_checks >= 10 then
    raise exception 'rate_limited' using errcode = '53400';
  end if;

  insert into public.email_availability_checks (user_id) values (auth.uid());

  return not exists (
    select 1 from auth.users where lower(email) = normalized
  );
end;
$$;

revoke all on function public.email_is_available(text) from public;
grant execute on function public.email_is_available(text) to authenticated;
