# Week 3 build log

Week 3's scope and gates are in [the implementation plan](week3-implementation-plan.md). This log distinguishes verified work from work that still needs a device, store or production credential. It is not a Week 3 completion claim.

## Phase 0 — baseline and contracts (2026-09-29)

- Branch: `main`, initially at `4216851`; unrelated untracked `.agents/`, `.aider-desk/`, `.claude/`, `data/`, and `skills-lock.json` left untouched.
- Mobile baseline: `npm test -- --runInBand` — **30 suites / 78 tests passed**; `npm run typecheck` — **passed**. Jest emits existing React `act(...)` warnings but exits 0.
- Admin baseline: `npm test` — **1 file / 19 tests passed**; `npm run typecheck` and `npm run build` — **passed**. Build reports a non-failing >500 kB chunk warning.
- Local SQL preview-entitlement test: `docker exec -i supabase_db_markhor-proj psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/preview_entitlement.sql` — **passed**, transaction rolled back.
- Supabase CLI: 2.105.0. Read CLI help and current changelog. Recent PostgreSQL minor-release warning is not directly implicated by these planned tables; check extension use before any upgrade. Local project is imperative migrations (`schema_paths=[]`).
- EPP project ref, from both ignored mobile/admin `.env` URLs: `knrjhmrsuyzzxlverryl`. This CLI session is **not linked** to it; `supabase projects list` currently enumerates only unrelated projects, so remote EPP migration history and writes are not verified. No remote change is authorized by inference from another project.
- Local migration history has `20260927155855` applied, while repo holds the preview-entitlement migration as `20260927183818`; the local schema already has its columns/function. Treat this as a migration-history mismatch until reconciled; do not apply the same change twice or blindly repair history. No Week 3 migration has been applied yet.
- Native app identifiers in `apps/mobile/app.json`: Android package and iOS bundle ID are both `com.entertainmentpowerplayers.app`. Their external store/RevenueCat registrations, products, prices, trials, testers and iOS signing are **unverified**. `.env` defines RevenueCat public-key slots, but does not prove configured products.
- The stable Week 3 app-side data contracts/query keys are in `apps/mobile/src/types/week3.ts`. Challenge `id` is identity, `order` is presentation; activity's persisted `weekKey` is canonical for history.

### Requirement-to-test map

| Requirement | Automated gate | Real-world gate |
|---|---|---|
| Stable progress after challenge reorder; atomic activity write-through | SQL migration/RLS/transition tests and mobile action tests | Admin edit with detail open, relaunch and inspect tracker history |
| Three tracker log types, goals, eight-week chart and swipe history | Unit/component tests for date/week, count, save/delete, zero goals | Device log/relaunch/delete at week boundary |
| Live admin content | Admin CRUD tests and mobile query tests | Edit open challenge/quote screen from deployed admin |
| Quote-of-day, saved quotes, image share | Deterministic date and favorites isolation tests | Two-device sync and image share sheet on Android/iOS |
| Monthly/annual purchase, restore, expiration, RLS | SDK mock tests, webhook event/replay tests and SQL RLS tests | Separate Google Play and Apple platform-sandbox transactions, second-device restore, expiry |

Phase 0 can close after the new contract typecheck and baseline recheck. Phase 1 may be developed/tested locally in rollback transactions; the migration-history mismatch and EPP remote history must be reconciled **before any remote database change**.

Phase 0 checkpoint: `499ff87`, pushed to `main`. The new contracts typecheck. External store registrations and EPP management access remain unverified prerequisites for later gates.

## Phase 1 — local database foundation (in progress, 2026-09-30)

- `20260929144443_week3_content_foundation.sql`: active challenge flag; stable challenge ID backfill alongside legacy order columns; linked challenge activity and historic-completion backfill; quote favorites with owner-only RLS/grants.
- `20260929191454_week3_challenge_transition.sql`: invoker-rights atomic single/counter/note transition and exact linked activity write-through. It verifies caller premium, challenge type and note/week inputs.
- `20260929191746_week3_admin_reorder.sql`: atomic full-list track/challenge reorders. Challenge reorder defaults **disabled** in `app_config.challenge_reorder_enabled` until old order-based APKs are retired.
- Local test assembled legacy fixture → all three migrations → RLS/backfill/transition/reorder checks in one transaction, then `ROLLBACK`. Passed: owner/other quote isolation, legacy progress→stable ID, exactly one completion activity, untick/decrement cleanup, counter cap, free-user rejection, admin reorder and cutover gate. No Week 3 migration is applied to the local or remote database yet.
- Remaining for Phase 1 acceptance: reconcile/verify EPP remote migration history; run advisors on migrated schema; migrate EPP staging and verify actual RLS/API access; retire/coordinate old APK progress writes; tighten direct-write rules after cutover. Therefore **Phase 1 is not complete** despite green local SQL tests.

Phase 1 local checkpoint: `56b1f87`, pushed to `main`. No database deployment occurred.

## Phase 2 — admin content changes (in progress, 2026-09-30)

- The admin challenge page now deactivates/restores instead of hard-deleting, includes inactive rows, validates positive counter targets, and uses the gated atomic reorder RPC. Track reorder uses its atomic RPC.
- Admin `npm run typecheck`, `npm test` (19 passed), and `npm run build` all pass. No Vercel deployment yet: its current EPP database lacks the un-applied Week 3 migrations, so shipping this UI first would produce schema/RPC errors.
- Mobile live-content rewiring, deployed admin testing, and open-screen content refresh are still pending. Phase 2 is **not complete**.

Admin checkpoint: `da5fa69`, pushed to `main`; deployment intentionally withheld until the EPP migration is live.

- Mobile now queries active tracks and challenges from Supabase with 10-second while-mounted refresh. The picker, Profile track selection, track list/detail and challenge detail no longer load bundled track/challenge records. Newly admin-created track slugs get a generic icon fallback.
- Challenge actions use the atomic `transition_challenge` RPC and update progress/activity caches; tracker history now reads persisted activity only, without title-based synthetic deduplication. Legacy position keys remain read-compatible until old APKs are retired; the new writes use stable challenge IDs.
- Mobile `npm run typecheck` passes; `npm test -- --runInBand --silent` passes **31 suites / 81 tests**, including new live-content mapping tests. No `--forceExit` required.
- This is still a **code-only checkpoint**: the currently deployed EPP database does not yet have the new columns/RPC, and no physical-device Supabase session or deployed admin edit has been exercised. Do not ship a new APK from this commit until schema rollout is verified.
