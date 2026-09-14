-- Admins must be able to read contacts regardless of their own is_pro status,
-- both to power the admin panel (list/edit/CRUD) and because Postgres RLS
-- requires INSERT/UPDATE ... RETURNING to satisfy the SELECT policy on the
-- affected rows -- an admin who is not also a paying subscriber could insert
-- a contact but not get it back in the response, surfacing as a confusing
-- "new row violates row-level security policy" error on plain admin writes.
alter policy contacts_read_pro on public.contacts
  using (is_pro() or is_admin());

alter policy track_challenges_read_pro on public.track_challenges
  using (is_pro() or is_admin());
