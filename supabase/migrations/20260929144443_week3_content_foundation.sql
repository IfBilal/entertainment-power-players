-- Week 3 expand-only migration. Existing APKs still address progress by
-- (track_slug, challenge_order), so retain those columns and their PK until
-- a minimum-version cutover. Admin reorder must remain disabled meanwhile.

alter table public.track_challenges
  add column active boolean not null default true;

alter table public.challenge_progress
  add column challenge_id text;

-- Resolve legacy progress before an admin is allowed to change order.
update public.challenge_progress as progress
set challenge_id = challenge.id
from public.track_challenges as challenge
where challenge.track_slug = progress.track_slug
  and challenge."order" = progress.challenge_order
  and progress.challenge_id is null;

do $$
begin
  if exists (
    select 1 from public.challenge_progress where challenge_id is null
  ) then
    raise exception 'Unmatched legacy challenge progress; inspect before rollout';
  end if;
end;
$$;

alter table public.challenge_progress
  add constraint challenge_progress_challenge_id_fkey
  foreign key (challenge_id) references public.track_challenges (id)
  on delete restrict;

create unique index challenge_progress_user_challenge_uidx
  on public.challenge_progress (user_id, challenge_id)
  where challenge_id is not null;

create index challenge_progress_challenge_id_idx
  on public.challenge_progress (challenge_id)
  where challenge_id is not null;

alter table public.activity
  add column challenge_id text references public.track_challenges (id)
  on delete restrict;

create unique index activity_user_challenge_uidx
  on public.activity (user_id, challenge_id)
  where type = 'challenge' and challenge_id is not null;

create index activity_challenge_id_idx
  on public.activity (challenge_id)
  where challenge_id is not null;

-- Older app versions synthesized history rows in JS, so real challenge
-- activity does not exist yet. UTC is a documented fallback for historic
-- completions whose original local timezone was never stored.
insert into public.activity (
  user_id, type, title, challenge_id, date, week_key, notes
)
select progress.user_id,
       'challenge',
       'Completed "' || challenge.title || '"',
       challenge.id,
       progress.completed_at,
       to_char(progress.completed_at at time zone 'UTC', 'IYYY-"W"IW'),
       progress.note
from public.challenge_progress as progress
join public.track_challenges as challenge on challenge.id = progress.challenge_id
where progress.status = 'complete'
  and progress.completed_at is not null
on conflict (user_id, challenge_id)
  where type = 'challenge' and challenge_id is not null
  do nothing;

create table public.quote_favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  quote_id text not null references public.quotes (id) on delete restrict,
  added_at timestamptz not null default now(),
  primary key (user_id, quote_id)
);

create index quote_favorites_quote_id_idx on public.quote_favorites (quote_id);

alter table public.quote_favorites enable row level security;

create policy "quote_favorites_owner_read" on public.quote_favorites
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "quote_favorites_owner_insert" on public.quote_favorites
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "quote_favorites_owner_delete" on public.quote_favorites
  for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, delete on public.quote_favorites to authenticated;

-- Owner-owned rows remain readable even if content is deactivated.
-- Content SELECT remains gated by the existing pro/admin RLS policy.
