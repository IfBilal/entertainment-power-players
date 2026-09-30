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

## Phase 3 — tracker client checkpoint (in progress, 2026-09-30)

- Contact and follow-up logging can now link an active directory contact for pro accounts, or use a manual title; free accounts do not query the gated directory. Events have local date and time pickers, and creation stores the selected instant and its local ISO `week_key`. There is no event edit UI, so the stored key never changes after creation.
- Dashboard shows counts, goals, accessible bars for all three types, a zero-goal label, and an eight-week chart labelled with ISO year/week. A foreground check and 30-second tick update the current week without an app restart; activity is invalidated on foreground/week rollover.
- History rows reveal a delete action on left swipe (with a visible accessibility fallback), confirm before server deletion, show a pending state, and invalidate the activity cache after the server succeeds. Challenge history remains read-only.
- Added integration tests for directory linking, event creation, durable deletion/reopen, and unit tests for eight-week gaps, ISO year rollover, zero goal carry-forward and persisted-week counting. `npm run typecheck` and `npm test -- --runInBand --silent` pass: **32 suites / 86 tests**.
- Not yet a Phase 3 acceptance claim: the native picker/swipe and force-stop/reopen flow have not been exercised on a device against migrated EPP. The EPP migration remains unavailable from this session, so no APK should be released from the current branch yet.

Tracker client checkpoint: `6ff89dd`, pushed to `main`.

## Phase 4 — Inspiration client checkpoint (in progress, 2026-09-30)

- Inspiration now reads active, deterministically ordered quotes from Supabase and computes a featured quote per local calendar date. The screen refreshes its date while open and on foreground, and live content continues to poll.
- Saved quotes now use owner-scoped `quote_favorites` as the source of truth. The per-user SecureStore list is imported once, idempotently, for IDs still present in active server content; another signed-in user does not receive those saves. A failed migration remains retryable. Server favorites refetch while mounted; offline saves are not queued, and failures show an error without claiming success.
- Share opens a branded preview; its primary action captures a PNG and opens native file sharing. Text share is only the fallback when file sharing is unavailable. Installed the SDK-compatible `react-native-view-shot` and `expo-sharing` packages.
- Mobile `npm run typecheck` and `npm test -- --runInBand --silent` pass: **33 suites / 89 tests**. Tests cover save/unsave, account isolation, migration retry/idempotency and the PNG share call. The actual exported image and native share sheet remain **unverified on Android/iOS devices**. No deployed EPP quote/favorite API test is possible until Phase 1 migration is applied.
- Phase 4A challenge target-change reconciliation and paid-plan navigation remain open; therefore Phase 4 is **not complete**.

Inspiration client checkpoint: `c73f13f`, pushed to `main`. This commit was unsigned because the local GPG pinentry timed out; no repository signing policy was changed.

## Phase 5 — billing client checkpoint (in progress, 2026-09-30)

- Installed `react-native-purchases` and added a narrow bridge. It configures only after a signed-in Supabase UUID and platform public key are present; account switching calls RevenueCat `logIn` with the new UUID. It does not use an anonymous or email ID.
- Paywall reads the current monthly/annual RevenueCat packages and their localized store prices, derives any annual savings from the two prices, renders intro pricing only when store metadata supplies it, handles purchase cancellation separately, and offers Restore. A purchase/restore does **not** toggle premium from SDK `CustomerInfo`: it waits for `is_pro()` to report a server entitlement. Missing keys/offering/product(s) show unavailable states. The temporary no-charge preview path is now development-only and only runs when platform keys are absent; the production paywall has no hardcoded price or test-activation button.
- Profile no longer advertises invented dollar prices. Detailed current plan/renewal status remains pending the server-owned subscription schema and webhook in Phase 6.
- Mobile `npm run typecheck` and full Jest suite pass: **34 suites / 91 tests**; the SDK bridge test covers UUID identity, monthly/annual package retrieval, account switch, purchase cancellation/error and restore. `npx expo export --platform android --output-dir /tmp/epp-week3-android-export` completed successfully (JS bundle only, **not** an APK or a native-billing test).
- Both platform RevenueCat public keys are **unset** in this workspace. RevenueCat products/entitlement/offering, platform store registration, server webhook and native sandbox transactions remain unverified. The temporary remote `activate_preview_plan` RPC must be disabled at the paid-billing cutover. No test APK from this branch should be treated as payment-ready.

Billing client checkpoint: `e03c9b2`, pushed to `main`.

## Phase 6 — local server-state checkpoint (in progress, 2026-09-30)

- `20260930110000_week3_billing_state.sql` adds owner-readable/server-writable subscription status, private event receipts, an idempotent/out-of-order-safe `apply_billing_snapshot` service RPC, and an authenticated 30-second reconciliation rate limit. The migration is expand-only: it does **not** turn off currently used preview grants.
- `revenuecat-webhook` requires the configured Authorization value and HMAC over the raw request body (5-minute timestamp window), validates app/environment/product/UUID identity, fetches authoritative RevenueCat subscriber state, and then calls the service-only RPC. Transfer events revoke the source UUID but never auto-grant a destination UUID; the destination must authenticate and reconcile itself. The authenticated `reconcile-subscription` function can only reconcile the caller's Supabase UUID, never a client-submitted user or boolean. Webhook JWT verification is disabled only for that named external webhook; reconciliation keeps platform JWT verification.
- `supabase/cutovers/week3_paid_entitlement.sql` is **manual, not a migration**: after a real store/webhook test on the correct EPP project, it disables test purchases, revokes the preview RPC, and makes `is_pro()` depend on unexpired paid server state. The file has not been executed outside rollback-only local tests.
- Local combined migration/RLS/billing/cutover test passed in one transaction and rolled back. Checks include replay, older snapshot rejection, server-write isolation, reconciliation rate limiting, cancellation preserving paid-period access and expiry revocation. Node tests pass for RevenueCat snapshot parsing, sandbox/product/identity rejection and HMAC validation (3 tests). Mobile still passes typecheck and **34 suites / 91 tests**.
- `supabase functions serve` loaded both new handlers in the local Edge Runtime, but HTTP invocation could not be completed because the local Kong API container is absent. The runtime download filled the disk; only the exact Edge Runtime container/image from this test and the temporary Android export were removed. Database and user files were untouched. Free space remains low (roughly 100 MB), so avoid new native builds until storage is available.
- **Not deployed or accepted:** EPP Supabase management is not connected here, no secrets or RevenueCat products are configured, and no webhook, native purchase, restore, transfer or expiration has run against EPP. Phase 6 and Week 3 remain incomplete.

Phase 4A safety follow-up: a later migration now rejects challenge type/target changes when any member progress exists, rather than silently changing completion semantics. Admin explains this and directs the editor to deactivate/create a replacement. Title, description, active state and order remain editable. This is a conservative guard, **not** the planned in-place target-change reconciliation; that remains open. The full rollback-only SQL suite including the guard passed. Admin typecheck, 19 tests and production build passed (existing non-failing bundle-size warning).
