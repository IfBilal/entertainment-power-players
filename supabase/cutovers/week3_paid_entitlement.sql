-- MANUAL CUTOVER ONLY. Do not add this file to migrations or apply until
-- RevenueCat products, webhook secrets, deployed functions, and sandbox
-- purchase/restore have been validated on the exact EPP project.
-- Existing preview grants are revoked; a paid server snapshot becomes the
-- only source of premium access. This is intentionally a separate transaction.
begin;

update public.app_config set test_purchases_enabled = false where id = true;
update public.profile_entitlements set test_pro = false, test_plan = null
where test_pro = true or test_plan is not null;
revoke execute on function public.activate_preview_plan(text) from authenticated;

create or replace function public.is_pro()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((
    select subscription.state in ('trial', 'active', 'cancelled')
       and subscription.active_until > now()
    from public.subscription_status as subscription
    where subscription.user_id = (select auth.uid())
  ), false);
$$;
revoke all on function public.is_pro() from public, anon;
grant execute on function public.is_pro() to authenticated;

commit;
