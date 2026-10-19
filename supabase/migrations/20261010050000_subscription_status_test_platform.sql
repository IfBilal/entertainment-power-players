-- Widen subscription_status.platform to accept 'test' (RevenueCat Test
-- Store), alongside the real 'apple'/'google' platforms. This is purely so
-- the reconcile/webhook pipeline can be proven end to end against RevenueCat
-- Test Store before any real App Store/Play Store product exists.
--
-- Safety is enforced in the Edge Function code (apps/functions/_shared/
-- revenuecat.ts), not here: a 'test' platform snapshot is only ever produced
-- when REVENUECAT_ENVIRONMENT is 'SANDBOX', and is explicitly rejected if it
-- somehow reached a 'PRODUCTION'-configured deployment.
alter table public.subscription_status
  drop constraint subscription_status_platform_check,
  add constraint subscription_status_platform_check check (platform in ('apple', 'google', 'test'));
