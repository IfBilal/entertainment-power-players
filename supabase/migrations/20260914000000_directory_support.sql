-- Week 2 / Workstream B support.
--
-- 1. category_contact_counts(): the handbook (§4.2) says free users see the
--    category grid AND the contact count, but not the contacts themselves.
--    RLS on `contacts` is pro-gated, so a plain count() from a free user
--    returns 0. This security-definer function returns just the aggregate
--    counts -- no row data ever leaves it -- so the grid badge works for
--    free users without leaking pro-only content. Same definer pattern
--    (and same search_path hardening) as is_pro()/is_admin().
--
-- 2. Composite indexes for the role/city filter sheet, per the Week 2
--    bullet "Composite indexes created for search and filter queries".

create or replace function category_contact_counts()
returns table (category_slug text, contact_count bigint)
language sql
security definer
stable
set search_path = ''
as $$
  select c.category_slug, count(*)::bigint
  from public.contacts c
  where c.active
  group by c.category_slug;
$$;

-- Signed-in users only; anonymous callers have no business enumerating
-- category sizes.
revoke execute on function category_contact_counts() from public, anon;
grant execute on function category_contact_counts() to authenticated;

create index contacts_category_active_role_idx on contacts (category_slug, active, role);
create index contacts_category_active_city_idx on contacts (category_slug, active, city);
