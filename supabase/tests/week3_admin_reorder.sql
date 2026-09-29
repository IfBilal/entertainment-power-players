-- Run after Week 3 migrations in the shared rollback test transaction.
reset role;
update public.profile_entitlements set is_admin = true
where user_id = '30000000-0000-0000-0000-000000000001';
select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000001', true);
set local role authenticated;

do $$
begin
  begin
    perform public.reorder_track_challenges('business', array[]::text[]);
    raise exception 'reorder bypassed the old-APK cutover gate';
  exception when object_not_in_prerequisite_state then
    null;
  end;
end;
$$;

reset role;
update public.app_config set challenge_reorder_enabled = true where id = true;
set local role authenticated;

do $$
declare
  v_track_slug text;
  challenge_ids text[];
  track_slugs text[];
  stable_id text;
begin
  select progress.track_slug, progress.challenge_id
  into v_track_slug, stable_id
  from public.challenge_progress as progress
  where progress.user_id = auth.uid() and progress.note = 'legacy completion';

  select array_agg(id order by "order" desc)
  into challenge_ids from public.track_challenges
  where track_challenges.track_slug = v_track_slug;

  perform public.reorder_track_challenges(v_track_slug, challenge_ids);
  if (select id from public.track_challenges
      where track_challenges.track_slug = v_track_slug
      order by "order" limit 1) <> challenge_ids[1] then
    raise exception 'challenge reorder did not take effect';
  end if;
  if (select challenge_id from public.challenge_progress
      where user_id = auth.uid() and note = 'legacy completion') <> stable_id then
    raise exception 'challenge reorder detached legacy progress';
  end if;

  begin
    perform public.reorder_track_challenges(v_track_slug, array[challenge_ids[1]]);
    raise exception 'incomplete challenge reorder was accepted';
  exception when invalid_parameter_value then
    null;
  end;

  select array_agg(slug order by "order" desc) into track_slugs from public.tracks;
  perform public.reorder_tracks(track_slugs);
  if (select slug from public.tracks order by "order" limit 1) <> track_slugs[1] then
    raise exception 'track reorder did not take effect';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '30000000-0000-0000-0000-000000000002', true);

do $$
begin
  begin
    perform public.reorder_tracks(array[]::text[]);
    raise exception 'non-admin track reorder was accepted';
  exception when insufficient_privilege then
    null;
  end;
end;
$$;
