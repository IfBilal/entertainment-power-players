-- Local rollback-only fixture for post-cutover challenge tests.
insert into auth.users (
  id, aud, role, email, email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data
) values (
  '30000000-0000-0000-0000-000000000001',
  'authenticated', 'authenticated', 'week3-owner@example.invalid',
  now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
), (
  '30000000-0000-0000-0000-000000000002',
  'authenticated', 'authenticated', 'week3-other@example.invalid',
  now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}'
);

update public.profile_entitlements
set is_pro = true, is_admin = true
where user_id = '30000000-0000-0000-0000-000000000001';

with single_challenge as (
  select id, track_slug, "order"
  from public.track_challenges
  where type = 'single' and active = true
  order by id limit 1
)
insert into public.challenge_progress (
  user_id, track_slug, challenge_order, challenge_id,
  status, count, completed_at, note
)
select '30000000-0000-0000-0000-000000000001', track_slug, "order", id,
       'complete', 1, '2026-09-29 23:59:00+00', 'legacy completion'
from single_challenge;

insert into public.activity (user_id, type, title, challenge_id, date, week_key, notes)
select progress.user_id, 'challenge', 'Completed "' || challenge.title || '"',
       challenge.id, progress.completed_at, '2026-W40', progress.note
from public.challenge_progress as progress
join public.track_challenges as challenge on challenge.id = progress.challenge_id
where progress.user_id = '30000000-0000-0000-0000-000000000001';
