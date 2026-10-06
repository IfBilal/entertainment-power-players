-- Follow-up to 20261006120000_email_availability_check: Supabase grants execute
-- to anon by default, so the first revoke (from public) was not enough.
-- Anonymous callers must not be able to check registered emails.
revoke execute on function public.email_is_available(text) from anon;
revoke all on table public.email_availability_checks from anon, authenticated;
