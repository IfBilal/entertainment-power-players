-- Performance hardening per Supabase's advisor after the initial schema:
-- 1. Wrap auth.uid() as (select auth.uid()) in owner-only policies so it's
--    evaluated once per statement, not once per row (auth_rls_initplan).
-- 2. Split each "admin can do everything" policy into insert/update/delete
--    only, so it no longer overlaps with the separate read policy on SELECT
--    (multiple_permissive_policies -- both policies were being evaluated on
--    every read for authenticated users).
-- 3. Add covering indexes for foreign keys the linter flagged as missing.

-- ---- owner-only policies: evaluate auth.uid() once per statement ----

drop policy "profiles_owner_all" on profiles;
create policy "profiles_owner_all" on profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy "profile_entitlements_owner_read" on profile_entitlements;
create policy "profile_entitlements_owner_read" on profile_entitlements for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy "favorites_owner_all" on favorites;
create policy "favorites_owner_all" on favorites for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "challenge_progress_owner_all" on challenge_progress;
create policy "challenge_progress_owner_all" on challenge_progress for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "activity_owner_all" on activity;
create policy "activity_owner_all" on activity for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop policy "goals_owner_all" on goals;
create policy "goals_owner_all" on goals for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- ---- split admin "for all" policies so they don't double up on SELECT ----

drop policy "categories_admin_write" on categories;
create policy "categories_admin_insert" on categories for insert to authenticated with check (is_admin());
create policy "categories_admin_update" on categories for update to authenticated using (is_admin()) with check (is_admin());
create policy "categories_admin_delete" on categories for delete to authenticated using (is_admin());

drop policy "quotes_admin_write" on quotes;
create policy "quotes_admin_insert" on quotes for insert to authenticated with check (is_admin());
create policy "quotes_admin_update" on quotes for update to authenticated using (is_admin()) with check (is_admin());
create policy "quotes_admin_delete" on quotes for delete to authenticated using (is_admin());

drop policy "tracks_admin_write" on tracks;
create policy "tracks_admin_insert" on tracks for insert to authenticated with check (is_admin());
create policy "tracks_admin_update" on tracks for update to authenticated using (is_admin()) with check (is_admin());
create policy "tracks_admin_delete" on tracks for delete to authenticated using (is_admin());

drop policy "app_config_admin_write" on app_config;
create policy "app_config_admin_insert" on app_config for insert to authenticated with check (is_admin());
create policy "app_config_admin_update" on app_config for update to authenticated using (is_admin()) with check (is_admin());
create policy "app_config_admin_delete" on app_config for delete to authenticated using (is_admin());

drop policy "contacts_admin_write" on contacts;
create policy "contacts_admin_insert" on contacts for insert to authenticated with check (is_admin());
create policy "contacts_admin_update" on contacts for update to authenticated using (is_admin()) with check (is_admin());
create policy "contacts_admin_delete" on contacts for delete to authenticated using (is_admin());

drop policy "track_challenges_admin_write" on track_challenges;
create policy "track_challenges_admin_insert" on track_challenges for insert to authenticated with check (is_admin());
create policy "track_challenges_admin_update" on track_challenges for update to authenticated using (is_admin()) with check (is_admin());
create policy "track_challenges_admin_delete" on track_challenges for delete to authenticated using (is_admin());

-- ---- missing FK indexes ----

create index activity_contact_id_idx on activity (contact_id);
create index challenge_progress_track_slug_idx on challenge_progress (track_slug);
create index favorites_contact_id_idx on favorites (contact_id);
