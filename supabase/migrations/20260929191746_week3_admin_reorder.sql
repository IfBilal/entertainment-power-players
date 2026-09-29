-- Reorder is a full-list, single-transaction operation. Challenge IDs and
-- progress attachment do not change. Do not expose this UI until older APKs
-- using order-based progress identity have been retired.
alter table public.app_config
  add column challenge_reorder_enabled boolean not null default false;

create function public.reorder_track_challenges(
  p_track_slug text,
  p_challenge_ids text[]
)
returns void
language plpgsql
security invoker
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

  -- The parent lock serializes reorders and conflicts with concurrent FK
  -- inserts of challenges into this track.
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
         on challenge.id = requested.id
        and challenge.track_slug = p_track_slug
       where challenge.id is null
     ) then
    raise exception 'Challenge reorder must contain each track challenge exactly once'
      using errcode = '22023';
  end if;

  -- Move all rows above the current range, then assign their final values.
  -- Two statements are required because the existing uniqueness is immediate.
  update public.track_challenges as challenge
  set "order" = v_base + ord.position::integer
  from unnest(p_challenge_ids) with ordinality as ord(id, position)
  where challenge.id = ord.id and challenge.track_slug = p_track_slug;

  update public.track_challenges as challenge
  set "order" = ord.position::integer - 1
  from unnest(p_challenge_ids) with ordinality as ord(id, position)
  where challenge.id = ord.id and challenge.track_slug = p_track_slug;
end;
$$;

revoke all on function public.reorder_track_challenges(text, text[])
  from public, anon;
grant execute on function public.reorder_track_challenges(text, text[])
  to authenticated;

create function public.reorder_tracks(p_track_slugs text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
begin
  if auth.uid() is null or not (select public.is_admin()) then
    raise exception 'Admin required' using errcode = '42501';
  end if;
  if p_track_slugs is null then
    raise exception 'Complete track list required' using errcode = '22023';
  end if;

  -- Lock all rows in a deterministic order to serialize full-list writes.
  perform 1 from public.tracks order by slug for update;
  select count(*) into v_count from public.tracks;
  if cardinality(p_track_slugs) <> v_count
     or (select count(distinct slug) from unnest(p_track_slugs) as slug) <> v_count
     or exists (
       select 1 from unnest(p_track_slugs) as requested(slug)
       left join public.tracks as track on track.slug = requested.slug
       where track.slug is null
     ) then
    raise exception 'Track reorder must contain each track exactly once'
      using errcode = '22023';
  end if;

  update public.tracks as track
  set "order" = ord.position::integer - 1
  from unnest(p_track_slugs) with ordinality as ord(slug, position)
  where track.slug = ord.slug;
end;
$$;

revoke all on function public.reorder_tracks(text[]) from public, anon;
grant execute on function public.reorder_tracks(text[]) to authenticated;
