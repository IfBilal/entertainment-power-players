# Week 2 implementation plan — Auth, Directory, Admin Panel

Status: **planning document, not yet built.** Written from a full re-read of `docs/Entertainment-Power-Developer-Handbook.md` and the current state of the codebase (Week 1 complete — see `docs/week1-acceptance.md`). This is the single source of truth for what Week 2 is and how to build it; read this end to end before writing any code.

---

## 1. What the handbook actually says (quoted, not paraphrased)

### §6 Week 2 — Auth, directory, admin panel

> - Auth complete: email/password, Apple, Google, forgot password, log out, delete account.
> - Directory complete: category grid, A–Z list with jump bar, search, filters, detail screen, tap actions, favourites, mark as contacted.
> - Admin panel: login and claim check, contacts CRUD, CSV bulk upload with error reporting, categories and icons.
> - Full dataset imported to staging. Composite indexes created for search and filter queries.
>
> **Done when:** the real directory is browsable on a device, and someone non-technical can add a contact through the panel and see it in the app without a restart.

### Supporting spec that Week 2 must satisfy (§4.2 Directory, in full)

> - Category grid showing the five categories with their admin-set icons. Contact counts per category.
> - Contact list inside a category: alphabetical, sticky letter headers, A–Z jump bar down the right edge **that scrolls to the section**.
> - Search across all categories by name, company or role. **Debounced 300 ms.** Query `nameLower` with a prefix match, plus company and role. If the dataset is under roughly 5,000 records, load once and filter in memory; above that, query the database and add the composite indexes.
> - Filter sheet inside a category: role and city, **built from the values actually present in the data**.
> - Contact detail: full record, tap to call, tap to email, tap to open website. Any field that is empty is hidden entirely, not shown as a blank row.
> - Favourite toggle **on both the list row and the detail screen**.
> - "Mark as contacted" on the detail screen writes an `activity` entry of type `contact` linked to that contact.
> - Free users see the category grid and the contact count, then the paywall in place of the list.

### Supporting spec for Admin panel (§5, Week-2-relevant bullets only — quotes/tracks/challenges CRUD is explicitly Week 3)

> - Login with email and password. Access requires the `admin` claim; anyone else is bounced to a plain "no access" screen.
> - **Contacts:** searchable table, create, edit, soft delete, restore. The form writes `nameLower` and `sortKey` automatically.
> - **Bulk upload:** CSV upload with a column-mapping step, a preview of the first ten rows, per-row validation and an error report naming the row numbers that failed. Valid rows import even if others fail. Write in batches of 500.
> - **Categories:** name, order and icon selection from the bundled icon set.
> - Changes appear in the app immediately, with no app update and no store review.

### Auth architecture (§2, adapted from Firebase to Supabase per the Week 1 migration)

> Entitlement is never decided by the client app. [RevenueCat → function → claim →] rules read that claim. The app reads the claim to decide what to render, but the lock lives in the rules.

On Supabase this maps to: `profile_entitlements.is_admin` / `is_pro`, checked by RLS policies (already built in Week 1), never trusted client-side for anything except *display*.

### Data model rules that apply directly to this week (§3)

> - `nameLower` and `sortKey` are written by the admin panel and the import function, **never by the app**.
> - Deletes are soft. Set `active: false`.

---

## 2. Explicit non-goals (do not build these now — later weeks)

- RevenueCat, real subscriptions, real `is_pro` entitlement flow → **Week 3**
- Tracker, Challenges, Inspiration going live (reading/writing real data) → **Week 3**
- Admin panel: quotes CRUD, tracks/challenges CRUD → **Week 3** (per §6 Week 3 bullet: "Admin panel: quotes, tracks and challenges CRUD")
- The mock `isPro`/paywall-gate logic built in Week 1 stays as-is for now — Directory's pro-gate still reads the same `useAppStore().isPro` flag client-side for *display*, but real contacts data now comes from Supabase with RLS enforcing the actual gate server-side (a non-pro user's query simply returns zero rows, regardless of what the client flag says — this is the "lock lives in the rules" principle already built in Week 1's RLS policies)

## 3. Current state this week builds on (verified, not assumed)

- **Mobile app**: all screens exist and work against local mock data (`apps/mobile/src/services/mock/*`). No screen currently calls Supabase. `apps/mobile/src/services/supabase/client.ts` exists (SecureStore-backed session persistence) but nothing uses it yet.
- **Supabase project** (`entertainment-power-players`, ref `knrjhmrsuyzzxlverryl`): schema + RLS live (`categories`, `quotes`, `tracks`, `track_challenges`, `contacts`, `app_config`, `profiles`, `profile_entitlements`, `favorites`, `challenge_progress`, `activity`, `goals`). Auth providers Email/Password + Google enabled. Seed data: 5 categories, 5 quotes, 6 tracks/60 challenges, **3 sample contacts only**.
- **CSV import Edge Function** (`supabase/functions/import-contacts-csv/`): deployed, admin-gated, works — but has no UI in front of it yet (that's this week's job).
- **`apps/admin/`**: empty placeholder, README only. Nothing scaffolded.

---

## 4. Decisions needed from you before/while building (flagging now, not guessing)

1. **Sign in with Apple**: requires your own Apple Developer Program membership ($99/yr) and a Services ID configured in Apple's developer portal, then wired into Supabase's Apple provider. I cannot create this for you — needed before "Auth complete" can include Apple for real. Google sign-in is already enabled and doesn't need this.
2. **Admin panel hosting**: the handbook says "deployed to Firebase Hosting" (no longer applicable post-migration). Needs a replacement — Vercel and Netlify both deploy a Vite static site for free with zero config. Recommend Vercel (fastest to wire up, I can do it via CLI same as the Supabase/Firebase setup). Confirm before Phase 3.
3. **"Full dataset imported to staging"**: no real client contact list exists yet. Options: (a) you provide a real CSV, or (b) I generate a larger realistic synthetic dataset (~100–200 rows across the 5 categories) purely to exercise search/filter/pagination/indexes properly, clearly labeled as placeholder data, replaced later with the real list. Recommend (b) now, swapped for (a) whenever you have it — flag which you want.

---

## 5. Workstreams

### Workstream A — Auth (mobile)

**Files touched:** `apps/mobile/src/features/onboarding/*` (wire real calls instead of UI-only), new `apps/mobile/src/services/supabase/auth.ts` (thin wrapper functions), new `apps/mobile/src/store/useAuthStore.ts` or extend `useAppStore` with a real session, `apps/mobile/src/features/profile/ProfileHomeScreen.tsx` (real log out + delete account).

- **Email/password sign up + log in** — `supabase.auth.signUp` / `signInWithPassword`. Wire `SignUpScreen`, `LoginScreen`.
- **Forgot password** — `supabase.auth.resetPasswordForEmail`, wire `ForgotPasswordScreen`. Needs a redirect URL configured (deep link back into the app, or a simple "check your email" confirmation screen for v1 — a full deep-link password-reset flow is more involved; recommend the "check your email" version for now unless you want the full deep link).
- **Sign in with Google** — Supabase's OAuth flow via `expo-auth-session` (standard Expo + Supabase pattern for native Google sign-in) or the simpler `supabase.auth.signInWithIdToken` with `@react-native-google-signin/google-signin`. Recommend the latter — it's the native Google One Tap-style flow, better UX than an in-app browser redirect.
- **Sign in with Apple** — `expo-apple-authentication` → `supabase.auth.signInWithIdToken({provider: 'apple', ...})`. Blocked on decision #1 above.
- **Log out** — `supabase.auth.signOut()`, reset local Zustand state, `RootNavigator` returns to Onboarding.
- **Delete account** — cannot be done from the client directly (a user can't delete their own `auth.users` row). Needs a new Edge Function `delete-account` (service-role, verifies the caller's own JWT first) that deletes the `auth.users` row — `profiles`, `profile_entitlements`, `favorites`, `challenge_progress`, `activity`, `goals` all cascade-delete automatically (already `on delete cascade` in the Week 1 schema). Mirrors the handbook's "Delete account removes the user document and all subcollections through a Cloud Function" (§4.7), adapted to Postgres cascade + an Edge Function trigger.
- **Session persistence + auto-login**: `RootNavigator` checks for an existing Supabase session on launch (via `supabase.auth.getSession()` / `onAuthStateChange`) and skips Onboarding if already logged in, going straight to Main.
- **Track picker write-through**: `TrackPickerScreen`'s selection already writes to `useAppStore`; add a real write to `profiles.selected_tracks` once the user is authenticated.

### Workstream B — Directory (mobile, real data)

**Files touched:** new `apps/mobile/src/services/supabase/directory.ts` (query functions), new TanStack Query hooks (`useCategories`, `useContacts`, `useFavorites`), `CategoryGridScreen`, `ContactListScreen`, `ContactDetailScreen` rewritten to read live data instead of `services/mock/contacts.ts`.

- **Category grid**: `select * from categories order by "order"` (free — RLS allows any signed-in user), plus a `count(*)` per category for the badge (a Postgres view or a grouped query — a small `select category_slug, count(*) from contacts where active group by category_slug` RPC or view, since RLS on `contacts` is pro-gated: **the count itself must not leak pro-only data to free users**. Handbook explicitly allows category grid + **count** to be free (§4.2 last bullet), so this needs a `security definer` RPC function that returns counts without going through the row-level pro gate — mirrors how `is_admin()`/`is_pro()` already bypass RLS internally.
- **Contact list**: query `contacts` where `category_slug = X and active = true`, ordered by `sort_key`. RLS already restricts this to pro users only — a free user's query simply returns 0 rows (or errors, needs testing) — client still shows the "Pro feature" lock screen based on the local `isPro` flag *for now* (real entitlement is Week 3), but the data layer itself is real.
- **A–Z jump bar**: make it actually scroll — `SectionList`'s `scrollToLocation({sectionIndex, itemIndex: 0})` via a ref, triggered by tapping a letter. (This was flagged as a gap during the Week 1 review — fix it here as part of "Directory complete.")
- **Search**: add the missing 300ms debounce (a small `useDebouncedValue` hook), keep the existing prefix-match-on-`name_lower` logic, but now querying live data. Given the "full dataset" for now is a few hundred rows (see decision #3), stay in the "under ~5,000 records → load once, filter in memory" branch of the spec — no need for server-side search queries yet.
- **Filter sheet**: build the actual bottom-sheet UI (role + city), populated from `availableRoles`/`availableCities` computed over the *currently loaded* real contacts (logic already written and tested in Week 1 — `apps/mobile/src/utils/contactSearch.ts` — just needs a UI in front of it, which didn't exist yet).
- **Contact detail**: swap mock lookup for a live `select * from contacts where id = X`.
- **Favourites**: replace `useFavoritesStore` (local-only) with real reads/writes to the `favorites` table (`user_id`, `contact_id`) — RLS already restricts to the owning user. Add the missing list-row favourite toggle (Week 1 gap — only the detail screen had one).
- **Mark as contacted**: already writes to `useTrackerStore` locally — change to a real `insert into activity (...)` row.
- **Composite indexes**: current migration has `contacts (category_slug, active, sort_key)` and `contacts (category_slug, active, name_lower)`. Add one for role/city filtering: `contacts (category_slug, active, role)` and `contacts (category_slug, active, city)` if the dataset grows past the in-memory threshold — write this migration now even if not strictly needed yet at a few hundred rows, since the handbook explicitly calls for it this week.

### Workstream C — Admin panel (new, `apps/admin/`)

**Stack**: React + Vite + TypeScript (per handbook §2), `@supabase/supabase-js`, a lightweight UI kit (shadcn/ui is a reasonable default — unstyled, fast to wire, no license concerns — flag if you'd prefer something else).

- **Scaffold**: `npm create vite@latest apps/admin -- --template react-ts`, wire Supabase client, basic routing (React Router).
- **Login + claim check**: email/password sign-in against the same Supabase Auth; after login, check `profile_entitlements.is_admin` for the signed-in user; if false, show a plain "no access" screen (per spec, word-for-word).
- **Contacts CRUD**: searchable table (client-side filter over a paginated query, or server-side search — table size is small for now), create/edit form that **computes `nameLower`/`sortKey` in the admin panel's own code** (never trust the client app to do this, matches §3), soft delete (sets `active: false`) + a "show inactive" toggle with restore.
- **CSV bulk upload UI**: the column-mapping step, 10-row preview, and per-row error report are new UI work — the underlying logic (`parseContactsCsv`, column mapping, validation) already exists in `supabase/functions/import-contacts-csv/csvImport.ts`. Two viable approaches:
  1. Call the existing Edge Function directly (already batches at 500, already reports `unmappedColumns`/`skipped`) — simplest, reuses everything.
  2. Run the parsing client-side in the admin panel (using the same `parseContactsCsv` logic, copied or extracted to a shared package) purely to render the *preview* (first 10 rows + column mapping UI) before the user confirms, then submit to the Edge Function for the actual write.
  **Recommend (2)** — the spec explicitly wants a preview *before* committing, which the current Edge Function doesn't support (it writes immediately). This means duplicating `parseContactsCsv`/`chunk` into `apps/admin/src/lib/` (same pattern already used to fork it from `functions/` into `supabase/functions/` in Week 1 — copy, don't share via fragile cross-package imports).
- **Categories UI**: name/order/icon fields, icon picker sourced from the same bundled Ionicons set already chosen in Week 1 (`apps/mobile/src/theme/icons.ts` — `categoryIconOptions`). Consider extracting that icon list into a small shared JSON/constants file both apps can read (or just duplicate it — five categories, low churn).
- **"Changes appear in the app immediately, no app update"**: since the mobile app will be querying Supabase live (Workstream B), this is naturally true — no extra work beyond Workstream B being done first.

### Workstream D — Data & indexes

- Generate/import the "full dataset" per decision #3 above, via the existing CSV import Edge Function (dogfooding it, which is also a good end-to-end test).
- Add the role/city composite indexes (see Workstream B).
- Re-run `supabase db query --local` RLS/advisor checks after all schema changes, same as Week 1's hardening pass — don't skip the advisor check just because it's "just an index."

---

## 6. Suggested build order (phases, each ending in tests green → commit → push)

1. **Auth** (Workstream A) — needed before Directory can be meaningfully "live" (RLS requires a real signed-in user).
2. **Directory** (Workstream B) — the mobile-side "done when" half.
3. **Admin panel scaffold + login + categories** (part of Workstream C) — smallest useful slice.
4. **Admin panel contacts CRUD + CSV upload UI** (rest of Workstream C) — the other "done when" half.
5. **Full dataset + indexes** (Workstream D) — do this once the CSV upload UI exists, so it's imported *through the panel* (proving the "done when" line for real, not via a script).

## 7. Testing strategy

- **Unit tests** (Jest, mobile): debounce hook, jump-bar scroll target calculation, any new pure logic — same pattern as Week 1 (`contactFields.test.ts`, `contactSearch.test.ts` etc. already exist and should keep passing unchanged).
- **RLS tests**: extend the intent already covered in Week 1's advisor checks — add explicit test cases for "a free (non-pro) authenticated user gets zero contacts back" and "a user cannot read another user's favorites/activity", run against local Postgres via `supabase db start` + `supabase migration up --local`, matching the Week 1 CI job.
- **Edge Function tests** (Deno): add tests for the new `delete-account` function's auth-boundary behavior (rejects without a valid JWT, only deletes the caller's own account).
- **Admin panel tests**: at minimum, unit tests for the CSV preview/column-mapping logic (once extracted) — mirror `csvImport.test.ts`.
- **Manual device verification** (I cannot do this myself): sign up a real account on-device, browse a real category, favourite/unfavourite, mark a contact as contacted, log out, log back in and confirm state persisted; separately, log into the admin panel, add a contact, and confirm it appears in the app "without a restart."

## 8. Acceptance criteria

Mirrors the handbook's own "Done when" line, broken into checkable sub-items:

**Auth complete**
- [ ] Sign up with email/password creates a real Supabase user; profile + entitlement rows auto-created (trigger already built in Week 1)
- [ ] Log in with email/password works; wrong password shows an error, not a crash
- [ ] Google sign-in works on a real device
- [ ] Apple sign-in works on a real device (blocked on decision #1)
- [ ] Forgot password sends a real reset email
- [ ] Log out clears the session and returns to Onboarding
- [ ] Delete account removes the auth user and all their data (verified via the Supabase dashboard, not just the app UI disappearing)

**Directory complete**
- [ ] Category grid shows real counts from the live database
- [ ] Contact list is alphabetical with sticky headers
- [ ] A–Z jump bar actually scrolls to the tapped section
- [ ] Search is debounced 300ms and matches name/company/role
- [ ] Filter sheet (role, city) works and only shows values present in the real data
- [ ] Contact detail hides empty fields, tap-to-call/email/website work
- [ ] Favourite toggle works from both the list row and detail screen, persisted to the database
- [ ] Mark as contacted writes a real `activity` row
- [ ] A free (non-pro) user cannot see contact data (verified at the RLS level, not just hidden in the UI)

**Admin panel**
- [ ] Login rejects non-admin users with a "no access" screen
- [ ] Contacts: create, edit, soft-delete, restore all work; `nameLower`/`sortKey` computed automatically, never typed by hand
- [ ] CSV bulk upload: shows column-mapping step, previews first 10 rows, reports per-row errors by row number, imports valid rows even when others fail
- [ ] Categories: name/order/icon editable, icon picker works

**The literal "done when" line**
- [ ] The real directory is browsable on a physical device (not just a simulator) — sign up, browse, no crashes
- [ ] A non-technical person can add a contact through the admin panel and see it appear in the app **without restarting the app**

## 9. Open questions to resolve before starting (recap)

1. Apple Developer account timeline — do you have one, or should Apple sign-in wait?
2. Admin panel hosting — Vercel OK, or a different preference?
3. Full dataset — real client data coming, or should I synthesize placeholder data now?
