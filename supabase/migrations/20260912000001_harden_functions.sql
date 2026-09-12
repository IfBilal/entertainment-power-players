-- Hardening per Supabase's security advisor after the initial schema migration:
-- 1. Pin search_path on all SECURITY DEFINER functions (mutable search_path
--    is a privilege-escalation vector -- a caller could otherwise shadow
--    `profile_entitlements` with a same-named object earlier in their path).
-- 2. `handle_new_user` is a trigger-only function; it has no business being
--    directly callable via the exposed `/rest/v1/rpc/` API, so revoke that.
--    (Revoking EXECUTE from anon/authenticated does not affect the trigger
--    itself, which invokes the function as its owner regardless of grants.)

create or replace function is_pro()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((select is_pro from public.profile_entitlements where user_id = auth.uid()), false);
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce((select is_admin from public.profile_entitlements where user_id = auth.uid()), false);
$$;

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.profile_entitlements (user_id) values (new.id);
  return new;
end;
$$;

revoke execute on function handle_new_user() from anon, authenticated;
