-- Run inside a transaction before week3_content_foundation.sql.
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
set is_pro = true
where user_id = '30000000-0000-0000-0000-000000000001';

insert into public.challenge_progress (
  user_id, track_slug, challenge_order, status, count, completed_at, note
)
select '30000000-0000-0000-0000-000000000001',
       challenge.track_slug, challenge."order", 'complete', 1,
       '2026-09-29 23:59:00+00', 'legacy completion'
from public.track_challenges as challenge
order by challenge.track_slug, challenge."order"
limit 1;
