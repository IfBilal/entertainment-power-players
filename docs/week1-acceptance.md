# Week 1 acceptance — Foundations & Design

Status against handbook §6 Week 1 and the "Done when" line.

## Backend migration: Firebase → Supabase

Week 1 was originally built against a live Firebase project (rules deployed, data seeded, Auth enabled — all verified, see "Historical: Firebase phase" below). The client then decided to switch to Supabase, triggered by a concrete blocker: Firebase's 2nd-gen Cloud Functions require the Blaze (pay-as-you-go) plan to deploy at all, confirmed by actually attempting a deploy against the real project (`Error: ...must be on the Blaze (pay-as-you-go) plan...`), not just reading docs. Supabase's free tier includes Edge Functions with no card required (confirmed via Supabase's billing FAQ and independent sources) and explicitly permits commercial/production use on the free tier.

The Firebase project was deleted after the switch was confirmed. Everything below reflects the **current, live Supabase backend** — the Firebase section further down is kept as a historical record of what was verified during that phase, not a current status.

## Current backend: Supabase — live and verified

Project: `entertainment-power-players` (ref `knrjhmrsuyzzxlverryl`), region `eu-central-1`.

| Item | Status | Evidence |
|---|---|---|
| Schema + RLS policies | ✅ Deployed | 3 migrations in `supabase/migrations/` — 12 tables translating the handbook §3 Firestore model to Postgres, RLS enabled on every table, verified via `supabase db query` returning zero unprotected tables |
| Security advisories | ✅ Clean | Ran Supabase's security advisor after every migration; fixed mutable `search_path` on all functions, revoked unnecessary `PUBLIC`/`anon` execute grants. One expected WARN remains (`is_admin()`/`is_pro()` callable by `authenticated`) — deliberate, since RLS policies depend on calling them, and they only reveal the caller's own flags |
| Performance advisories | ✅ Clean | Fixed `auth.uid()` re-evaluation per row (wrapped as `(select auth.uid())`), split overlapping admin/read policies, added missing FK indexes |
| Real data seeded | ✅ Done | `supabase/seed.sql` — 5 categories, 5 quotes, 6 tracks × 10 challenges (60), 3 sample contacts, 1 config row. Verified via row counts on the live project |
| Auth providers | ✅ Enabled | Email/Password and Google, confirmed via the dashboard and the Auth Admin API |
| `handle_new_user` trigger | ✅ Verified live | Signed up a real test user against the live project; confirmed `profiles` + `profile_entitlements` rows were auto-created |
| CSV import Edge Function | ✅ Deployed and verified end-to-end | `supabase/functions/import-contacts-csv/` — deployed, then actually invoked against the live project with the real sample CSV: `{"imported":3,"skipped":[],"unmappedColumns":[]}`. Also verified the admin-only boundary: the same call from a non-admin session was rejected with 403 |
| Mobile app wiring | ✅ Config point-in-place | `apps/mobile/src/services/supabase/client.ts` (SecureStore-backed session persistence), `.env` filled in with the real project's URL/anon key. Screens still read local mock data — wiring real reads/writes is Week 2/3 scope regardless of backend |
| Test cleanup | ✅ Done | The test admin user, and duplicate contacts created during the live Edge Function test, were deleted after verification — the project reflects only the intended seed data |

## Handbook §6 Week 1 checklist

| Item | Status | Evidence |
|---|---|---|
| Backend project, database structure, security rules written and passing tests | ✅ Done | See "Current backend: Supabase" above |
| Repo, TypeScript config, navigation skeleton, theme tokens, shared component primitives | ✅ Done | `apps/mobile/tsconfig.json` (strict), `apps/mobile/src/theme/`, `apps/mobile/src/components/`, `apps/mobile/src/navigation/` |
| CSV import function written and run against a sample of the real data | ✅ Done, verified end-to-end against the live project | `supabase/functions/import-contacts-csv/` — see above |
| Every column in the source data mapped to a field, any unmapped column reported | ✅ Done | `KNOWN_COLUMNS` in `csvImport.ts`; `unmappedColumns` in the report; unit-tested (17 Deno test steps) and confirmed live (`"unmappedColumns":[]` on the real sample CSV) |
| Full screen designs for all five tabs, plus onboarding and paywall | ✅ Done | All screens in `apps/mobile/src/features/**`, built as real running Expo screens (not Figma — confirmed with you), covering every screen listed in handbook §4 |
| Icon set options prepared for category selection | ✅ Done, signed off | `apps/mobile/src/theme/icons.ts`, written up in `docs/icon-options.md` — approved as-is |

## "Done when" line

> designs cover every screen in section 4, and the import script loads sample data into staging with rules enforced

Both halves are now fully verified, not just written:
- **Designs cover every screen in §4**: ✅ verified by inventory — onboarding (splash, 3 intro slides, sign up, login, forgot password, track picker), Directory (category grid, contact list w/ search+filter+A–Z jump bar, contact detail, favourites, mark-as-contacted), Tracker (dashboard, log entry, goals editor, 8-week chart, history), Challenges (track list, track detail with single/counter challenges + notes), Inspiration (quote feed + quote of the day + share/save UI), Profile, Paywall. All reachable via navigation, exercised by the `mainTabNavigator.test.tsx` and `onboardingNavigator.test.tsx` tests.
- **Import script loads sample data into staging with rules enforced**: ✅ Actually invoked against the live Supabase project with the real sample CSV and got a correct report back; the admin-only RLS boundary was verified by confirming a non-admin call gets rejected.

## Known substitutions from the handbook's literal tech choices

- **Backend**: handbook specifies Firebase throughout. Switched to Supabase (Postgres + RLS instead of Firestore + security rules, Edge Functions instead of Cloud Functions) — see migration note above.
- **Charts**: handbook §2 names Victory Native. Built instead as a small custom flexbox `BarChart` component (`apps/mobile/src/components/BarChart.tsx`). Victory Native's current major version pulls in `@shopify/react-native-skia` + `react-native-reanimated` + `react-native-gesture-handler`, which need careful babel/native config to get right — not worth the fragility for a static 8-week trend bar chart with no device to test on. Swapping in Victory Native later is a contained change (one component).
- Everything else in the handbook's library table (React Navigation, Zustand, TanStack Query, React Hook Form + Zod, FlashList/SectionList, PapaParse) is used as specified.

## Test summary

- `apps/mobile`: `npx tsc --noEmit` clean; `npm test` → 34 tests passing across 9 suites (pure logic: nameLower/sortKey, week-key ISO rollover incl. year boundary, quote-of-the-day determinism, paywall gating, challenge single/counter state machine, contact search/filter/grouping; component smoke tests; navigation reachability tests for all 5 tabs + onboarding).
- `supabase/functions/import-contacts-csv`: 17 Deno test steps passing (CSV parsing/validation/column-mapping against the real sample CSV, shared `nameLower`/`sortKey` derivation) — confirmed via `deno test --allow-read` in a real Deno runtime (Docker), matching what CI runs.
- Database: schema + RLS verified against both the live project and a fresh local Postgres (via `supabase db start` + `supabase migration up --local`) — migrations apply cleanly from scratch either way.
- CI (GitHub Actions, `.github/workflows/ci.yml`): 4 jobs as of Week 2 — mobile (typecheck + tests), admin panel (typecheck + tests), edge-functions (Deno tests), database (local Postgres schema/RLS check via Supabase CLI).

---

## Historical: Firebase phase (superseded, kept for record)

Before the switch to Supabase, this project had a live Firebase project (`entertainment-power-play-bcf29`) with:
- Firestore rules + indexes deployed, verified against a real emulator in CI (17/17 assertions)
- Real data seeded (5 categories, 5 quotes, 6 tracks × 10 challenges, 3 sample contacts)
- Auth enabled (Email/Password + Google, confirmed via the Identity Toolkit API)
- A CSV import Cloud Function written and unit-tested, blocked from deploying by the Blaze plan requirement — this was the actual trigger for the backend switch

The Firebase project was deleted per the client's instruction once the Supabase migration was confirmed working. `firebase/` and `functions/` directories were removed from the repo and replaced by `supabase/`.
