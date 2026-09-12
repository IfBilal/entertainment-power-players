-- Initial schema for Entertainment Power Players, translated from the
-- Firestore data model in docs/Entertainment-Power-Developer-Handbook.md §3.
--
-- Entitlement (`is_pro`, `is_admin`) lives in a separate `profile_entitlements`
-- table rather than on `profiles` itself, and is only writable by the service
-- role -- this mirrors how the Firebase version kept the `pro`/`admin` claim
-- out of anything the client could write directly to `users/{uid}`.

-- ============================================================================
-- Content tables (admin-owned, readable per the free/pro split)
-- ============================================================================

create table categories (
  slug text primary key,
  name text not null,
  icon text not null,
  "order" integer not null
);

create table quotes (
  id text primary key,
  text text not null,
  author text not null,
  active boolean not null default true,
  "order" integer not null
);

create table tracks (
  slug text primary key,
  name text not null,
  "order" integer not null,
  active boolean not null default true
);

create table track_challenges (
  id text primary key,
  track_slug text not null references tracks (slug) on delete cascade,
  "order" integer not null,
  title text not null,
  description text not null,
  type text not null check (type in ('single', 'counter')),
  target integer,
  unique (track_slug, "order")
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_lower text not null,
  sort_key text not null,
  category_slug text not null references categories (slug),
  role text not null,
  company text,
  email text,
  phone text,
  website text,
  city text,
  notes text,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index contacts_category_active_sortkey_idx on contacts (category_slug, active, sort_key);
create index contacts_category_active_namelower_idx on contacts (category_slug, active, name_lower);

create table app_config (
  id boolean primary key default true check (id), -- singleton row trick
  min_version text not null,
  paywall_copy text not null,
  free_tier_rules text not null
);

-- ============================================================================
-- Per-user tables (owner-only, mirrors users/{uid}/**)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  photo_url text,
  selected_tracks text[] not null default '{}',
  notification_prefs jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Entitlement, deliberately separate from `profiles` so no user-writable
-- policy can ever touch it -- only the service role (Edge Functions, admin
-- panel) writes here.
create table profile_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  is_pro boolean not null default false,
  is_admin boolean not null default false
);

create table favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  contact_id uuid not null references contacts (id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (user_id, contact_id)
);

create table challenge_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  track_slug text not null references tracks (slug) on delete cascade,
  challenge_order integer not null,
  status text not null check (status in ('not_started', 'complete')),
  count integer not null default 0,
  completed_at timestamptz,
  note text,
  primary key (user_id, track_slug, challenge_order)
);

create table activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('contact', 'event', 'followUp', 'challenge')),
  title text not null,
  contact_id uuid references contacts (id),
  date timestamptz not null,
  week_key text not null,
  notes text
);

create index activity_user_weekkey_idx on activity (user_id, week_key, date desc);

create table goals (
  user_id uuid not null references auth.users (id) on delete cascade,
  week_key text not null,
  contacts integer not null default 0,
  events integer not null default 0,
  follow_ups integer not null default 0,
  primary key (user_id, week_key)
);

-- ============================================================================
-- Helper functions for RLS policies
-- ============================================================================

create or replace function is_pro()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_pro from profile_entitlements where user_id = auth.uid()), false);
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
as $$
  select coalesce((select is_admin from profile_entitlements where user_id = auth.uid()), false);
$$;

-- ============================================================================
-- RLS
-- ============================================================================

alter table categories enable row level security;
alter table quotes enable row level security;
alter table tracks enable row level security;
alter table track_challenges enable row level security;
alter table contacts enable row level security;
alter table app_config enable row level security;
alter table profiles enable row level security;
alter table profile_entitlements enable row level security;
alter table favorites enable row level security;
alter table challenge_progress enable row level security;
alter table activity enable row level security;
alter table goals enable row level security;

-- categories, quotes, tracks, app_config: read by any signed-in user; admin-only writes
create policy "categories_read_signed_in" on categories for select to authenticated using (true);
create policy "categories_admin_write" on categories for all to authenticated using (is_admin()) with check (is_admin());

create policy "quotes_read_signed_in" on quotes for select to authenticated using (true);
create policy "quotes_admin_write" on quotes for all to authenticated using (is_admin()) with check (is_admin());

create policy "tracks_read_signed_in" on tracks for select to authenticated using (true);
create policy "tracks_admin_write" on tracks for all to authenticated using (is_admin()) with check (is_admin());

create policy "app_config_read_signed_in" on app_config for select to authenticated using (true);
create policy "app_config_admin_write" on app_config for all to authenticated using (is_admin()) with check (is_admin());

-- contacts, track_challenges: read only if pro; admin-only writes
create policy "contacts_read_pro" on contacts for select to authenticated using (is_pro());
create policy "contacts_admin_write" on contacts for all to authenticated using (is_admin()) with check (is_admin());

create policy "track_challenges_read_pro" on track_challenges for select to authenticated using (is_pro());
create policy "track_challenges_admin_write" on track_challenges for all to authenticated using (is_admin()) with check (is_admin());

-- profiles: owner read/write (excluding entitlement, which lives elsewhere)
create policy "profiles_owner_all" on profiles for all to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- profile_entitlements: owner can READ their own entitlement (so the app can
-- show pro/free status), but only the service role can write it -- no
-- policy grants authenticated users insert/update/delete here.
create policy "profile_entitlements_owner_read" on profile_entitlements for select to authenticated using (auth.uid() = user_id);

create policy "favorites_owner_all" on favorites for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "challenge_progress_owner_all" on challenge_progress for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "activity_owner_all" on activity for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_owner_all" on goals for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create a profile + entitlement row when a new auth user signs up.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id) values (new.id);
  insert into profile_entitlements (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
