# Week 3 implementation plan — Tracker, Challenges, Inspiration, Subscriptions

Status: **plan only; not implemented or accepted.** Prepared 2026-09-29 for a coding agent working on `main`. The [Developer Handbook](Entertainment-Power-Developer-Handbook.md), especially §3, §4.3–4.6, §5, §6 Week 3 and §7, is the product source of truth. This plan translates its Firebase wording into this repository's established **Supabase + Vercel** architecture; it does not change the product requirements.

## 1. Mission and definition of done

Deliver all six Week 3 bullets from handbook §6:

1. Tracker: current-week dashboard; contact, event and follow-up logging; goals and all three progress bars; eight-week chart; complete history.
2. Challenges: first-signup track picker, live track list and detail, progress ring, single and counter challenges, notes, and real tracker activity write-through.
3. Inspiration: live feed, deterministic quote of the day, branded **image** share, saved quotes.
4. Admin: quotes, tracks and challenges create/edit/reorder/deactivate/restore; edits appear in an open app without shipping a bundle.
5. RevenueCat: store products, two plan choices, optional trial only when configured, real purchase and restore flows, authenticated webhook, server-owned entitlement, database gates and subscription status.
6. An actual sandbox subscription end to end on **Android and iOS**.

The handbook's finish line is a **new account → signup → track picker → paywall → sandbox purchase → access to every gated screen**. Call Week 3 complete only after this sequence has been demonstrated on both platforms, plus the negative/expiry cases in §11 below. A simulator, mocked SDK, Expo Go, a RevenueCat Test Store purchase, or a green unit suite alone cannot satisfy the platform-sandbox gate. If iOS store access is unavailable, report Week 3 as *implemented but not fully accepted*, with the exact missing evidence.

The user has accepted Weeks 1–2 on device. Preserve those flows. Apple **sign-in** is explicitly deferred by the user; Apple **in-app subscription** remains in Week 3. Week 4's release submission, comprehensive multi-device matrix, and store artwork are outside this plan, apart from assets/build settings strictly needed to test Week 3 billing.

## 2. Current-state audit (2026-09-29)

This is a code snapshot, not a claim about live production state. Reconfirm it at the start of implementation.

| Area | Existing working foundation | Exact Week 3 gap |
|---|---|---|
| Tracker | `apps/mobile/src/services/supabase/activity.ts`, `goals.ts`, hooks and dashboard/history screens persist activity and goals. Eight-week calculation exists. | `LogEntryScreen.tsx` has the same title/notes form for every type: no directory-contact picker or manual/contact distinction, no event date. Dashboard has a contacts ring but no events/follow-ups progress bars. History has a trash button, not swipe delete. |
| Challenge content | `track_challenges` has stable `id`, and admin has `TracksPage.tsx` / `TrackChallengesPage.tsx`. | Mobile `TrackListScreen.tsx`, `TrackDetailScreen.tsx`, `ChallengeDetailScreen.tsx`, onboarding `TrackPickerScreen.tsx`, profile and `completedChallengeEntries()` still use `services/mock/challenges.ts`. Admin challenge “Remove” hard-deletes; two concurrent reorder updates can hit the `(track_slug, order)` unique constraint. |
| Challenge progress | `challenge_progress` saves status/count/note. | Primary key is `(user_id, track_slug, challenge_order)`, so admin reorder can misattach progress. Completion is only synthesized as tracker history in JS; there is no durable linked `activity` row. `useTrackerEntries()` dedupes by title, which is unsafe after wording edits. |
| Inspiration | Quote feed layout and quote-of-day helper exist; all visible cards have save/share actions. Quotes admin CRUD exists. | Feed reads bundled `mockQuotes`, pins `quote_featured` instead of using quote-of-day, shares text via `Share.share`, and saved IDs live only in device SecureStore. |
| Billing | Paywall UI has monthly/annual selection, `profile_entitlements`, RLS `is_pro()` gate, and a temporary preview RPC. | Prices and “Save 25%” are hardcoded; `react-native-purchases` is absent; no RevenueCat products/offerings/webhook; non-preview Subscribe/Restore do nothing. `__DEV__` grants a free test plan. Subscription Profile lacks real renewal/status/cancel guidance; premium refresh only runs during auth hydration. |
| Admin | Quotes/tracks/challenges pages are deployed on Vercel according to previous user confirmation. | Challenge soft-deactivation and safe reorder need work; verify live mobile updates and all CRUD paths. |

Evidence: `supabase/migrations/20260912000000_init_schema.sql`, `20260927183818_enable_test_purchases.sql`, `apps/mobile/src/features/{tracker,challenges,inspiration,subscription}`, `apps/mobile/src/services/supabase/{challenges,billing}.ts`, and the three admin content pages. The temporary test switch currently lives in `app_config.test_purchases_enabled` and `profile_entitlements.test_pro/test_plan`; its isolation/removal is a launch-critical task, not proof of paid billing.

### Architecture mapping

| Handbook term | EPP implementation |
|---|---|
| Firestore content/user documents | Supabase Postgres tables and RLS |
| Cloud Function for purchase events | Supabase Edge Function with server-only secret key |
| Firebase `pro` custom claim | Server-maintained `profile_entitlements` and `is_pro()` in RLS; mobile copy only controls display |
| Firebase emulator | Local Supabase stack / isolated staging, SQL/RLS tests and real store sandboxes |
| Firebase Hosting | Existing Vercel admin deployment |

The **database gate** is authoritative: a tampered or stale client must not read `contacts` or `track_challenges`. RevenueCat `CustomerInfo` is useful purchase feedback, but must not directly overwrite a client-writable premium flag that bypasses RLS.

## 3. Agent execution contract

Work directly on `main`, as the user requested. Push after each verified phase; stage only files changed for that phase. Preserve all unrelated untracked/user-owned files. At each checkpoint, record commit SHA, migrations applied, build/test commands and results, screenshots/video for UI changes, and any remaining physical-device gate. Do not call a phase done because the UI renders with mocks.

Before touching the database, read the Supabase and Supabase Postgres skills, check the [Supabase changelog](https://supabase.com/changelog.md), verify the CLI's actual `--help`, identify the **EPP** project ref from local config, and compare local migration history with the intended EPP environment. Use a local database or isolated staging for migration iteration, inspect RLS/advisors, then apply approved migrations to the correct project. Never use the other project mentioned in earlier conversation. New tables in the exposed schema need explicit grants where required **and** RLS. Keep service/secret keys and webhook auth secrets out of mobile, admin and Git.

Use the repo's tests and strict TypeScript. Keep data access behind `src/services/supabase/`, feature hooks for cache invalidation and UI in feature folders. The `apps/mobile` and `apps/admin` package scripts are authoritative. Add native dependencies with Expo-compatible versions, pin versions/lockfile, and justify them in the commit. No RevenueCat receipt or store notification should be trusted merely because the client says “purchase succeeded.”

### Prerequisites / decisions to establish in Phase 0

- Confirm Android package ID, iOS bundle ID, app ownership, and that **the same IDs** exist in Play Console/App Store Connect and RevenueCat. Record IDs in a private operations checklist, not credentials in this file.
- Obtain/verify RevenueCat project access; Android and iOS *public SDK keys*; Android/Apple store connections; store test accounts; signed build capability. The coding agent should do dashboard/CLI work where available and ask the user only for account-holder-only actions.
- Confirm monthly and annual **product IDs, actual prices/territories**, and whether either plan has an introductory trial. The handbook does not set a price or require a trial. Let store metadata render the price and trial terms; do not cement the current `$9.99`, `$49.99` or “Save 25%” text without product truth.
- Decide sandbox separation: separate EPP Supabase staging project is safest. If testing against the current EPP project, document test-account IDs and explicitly prevent sandbox/test-store events from conferring production access. Verify RevenueCat's Sandbox Testing Access setting and webhook environment filters.
- Confirm the handbook's content rule: all quotes/tracks/challenges/categories come from Supabase at runtime. Seed rows are data, not app-bundle fallbacks.

## 4. Phase 0 — Baseline, contracts and test fixtures

**Build:** Check `git status`, upstream `main`, `supabase/config.toml`, migrations, environment keys, SDK/build profiles, installed tests, and admin deployment target. Run baseline mobile `npm test -- --runInBand` and `npm run typecheck` from `apps/mobile`; admin `npm test`, `npm run typecheck`, `npm run build` from `apps/admin`; run available SQL tests against an isolated local Supabase. Save exact results. Make a requirement-to-test checklist from §1 and §10; identify which tests need real hardware or dashboard permissions.

**Data contract:** Define TypeScript entities for `Track`, `Challenge`, `ChallengeProgress`, `Activity`, `Quote`, `QuoteFavorite`, `SubscriptionStatus`; define query keys and cache-invalidation events. `challenge.id`, not array position/order, is identity. `order` is presentation only. Document the semantics of the three tracker goals versus challenge activity: contacts/events/follow-ups have three progress bars; completed challenges also appear in history and count in the **eight-week total activity** chart, but do not masquerade as one of the three goal types. Preserve each activity's `week_key` at creation in the user's local timezone.

**Exit gate:** Baseline report and contract are committed/pushed; no migrations or UI behavior changed; every later phase has an observable test target. If baseline tests already fail, classify pre-existing failures explicitly rather than silently absorbing them.

## 5. Phase 1 — Migration-safe content and user-data model

Do this before rewiring challenges. Produce **forward-only** Supabase migrations in small slices, with backfill and verification queries. Never hard-delete user progress/content to make a migration easy.

### 1A. Stable challenge identity and soft deletes

1. Add `track_challenges.active boolean not null default true`. Keep the existing `id` stable for an edit, reorder or deactivation. Replace admin “Remove” with `active=false` and Restore with `active=true`; any true permanent deletion must be limited to account deletion/data-retention work, not normal content operations. `tracks.active` and `quotes.active` already exist.
2. Add a nullable `challenge_progress.challenge_id` referencing `track_challenges(id)` (choose `on delete restrict` or equivalent preservation). Backfill by exact `(track_slug, challenge_order)` join **before** any reorder. Verify `unmatched = 0`, duplicate target pairs = 0, and row counts unchanged. Keep old columns temporarily for compatibility with already-installed APKs, then move PK/unique identity to `(user_id, challenge_id)` in a later migration after app rollout. Do not allow conflicting legacy writes once reorder is enabled. Plan a compatibility gate or coordinated release: admin reorder stays disabled until new mobile writes by ID and the backfill is verified. Once compatibility window ends, remove old position-based identity safely. Consider inactive challenges in historical progress; deactivate should hide them from active completion denominator but preserve records.
3. Index `challenge_progress(challenge_id)` and queries by `user_id`; inspect actual query plans before adding redundant indexes. Add constraints for counter `target > 0`, valid status/count range and nonnegative goals only after checking legacy rows. Index foreign keys and use short migration transactions. Do not create `ADD CONSTRAINT IF NOT EXISTS` (invalid Postgres syntax).
4. RLS: free authenticated users can read active **track names**, but not challenge details; pro users and admins can read active challenges. Owners alone can read/write progress; admins own content writes. If progress on a deactivated challenge must remain visible to its owner, keep owner progress policy independent of content-read policy. Explicitly test admin `UPDATE ... RETURNING`/SELECT behavior.

### 1B. Durable challenge-to-activity link

1. Add a durable relation from `activity` to `challenge_id` (and, if needed, a completion-epoch identifier); enforce at most one **active completion activity** per user/challenge. A single completion transition writes progress and an `activity(type='challenge')` row atomically; untick or decrement below target removes **that exact linked row**, not any row matching a title. Completed title may be a snapshot of wording at completion; `challenge_id` carries identity after admin edits.
2. Implement this transition as a tightly scoped transactional database function/RPC (or another genuinely atomic server operation). Validate `auth.uid()`/ownership, pro entitlement, active challenge, type/target, allowed delta, and note bounds; pin safe `search_path`, qualify objects, revoke default public function execution and grant only required roles. If a privileged function is necessary, explain why and test forged user IDs; otherwise use invoker rights. Ensure repeated taps/retries cannot duplicate completion activity, and a failed second write rolls back the first.
3. Define delete semantics explicitly: manual activity is swipe-deletable; a challenge completion entry is changed via its challenge control, with a deep link or explanation from history. Do not let a history delete leave progress complete but no corresponding activity. Preserve the completion's original local `week_key` in the activity row; re-rendering on another device/timezone must not recalculate history weeks.
4. Backfill existing completed challenge progress into linked activity once, with deterministic deduplication, preserved `completed_at` and a documented timezone limitation for historic rows that never stored timezone/week key. Exclude synthetic JS entries after migration. Assert 1:1 completed progress/activity counts and no duplicate history rows before switching readers.

### 1C. Saved quotes and admin reorder

1. Add `quote_favorites(user_id, quote_id, added_at)` with `(user_id,quote_id)` uniqueness, FKs and indexes. Owner-only RLS for select/insert/delete; no user can write another user's favorite. Soft-deactivated quotes can remain saved but render with a clear unavailable state, or be omitted while preserving favorite rows—choose one behavior and test it. Use a quote FK that preserves favorites if normal admin deactivation occurs.
2. Replace unsafe challenge order swapping with one atomic reorder operation that validates the admin and reassigns a whole track's order in one transaction without intermediate unique-key conflicts. The implementation may use a temporary ordering range or a validated full-list RPC; reordering must not change challenge IDs or completion attachment. Provide the same atomicity for track reorder, and deterministic quote order with no duplicates if quotes are re-ordered.
3. Add `updated_at` or Realtime publication where needed for app refresh; choose a single update mechanism in Phase 2. Do not subscribe to entire per-user tables if query invalidation on screen focus and targeted Realtime content changes suffice.

**Tests:** SQL migration/backfill tests with existing progress rows, reordered/deactivated challenges, duplicate completion calls, counter crossing target in both directions, unauthorized client writes, free/pro/admin reads, quote favorites isolation, and admin reorder concurrency. Run Supabase advisors, inspect grants/RLS and generated schema types. **Exit gate:** stable IDs and owner isolation are proven on local/staging; old APK compatibility strategy is written down; migrations applied only to the intended EPP project; commit/push migrations + tests.

## 6. Phase 2 — Live admin content and live mobile reads

**Admin (`apps/admin/src/pages/QuotesPage.tsx`, `TracksPage.tsx`, `TrackChallengesPage.tsx`):** Keep existing create/edit affordances, wire new active/restore behavior and atomic reorder; validate title/description/quote text, `single` versus `counter` and positive target; handle duplicate order/slug and network errors visibly. Show inactive records separately so an operator can restore them. Never change a challenge `id` during edit. Confirm only admin accounts can mutate; non-admin gets the existing no-access route. Deploy the verified admin build to its existing Vercel project after tests, and record deployed URL/build ID without exposing admin credentials.

**Mobile data (`apps/mobile/src/services/supabase/` and hooks):** Add live queries for active tracks (free), active challenges (pro), active quotes (free) and own challenge progress. Replace `services/mock/challenges.ts` imports in `TrackPickerScreen`, `ProfileHomeScreen`, `TrackListScreen`, `TrackDetailScreen`, `ChallengeDetailScreen`, `services/supabase/challenges.ts`, and related hooks. Replace `mockQuotes` in the Inspiration screen (Phase 4). Retain pure algorithms in utilities, but no bundled record is a runtime source. Keep selected tracks by immutable track slug and validate that selected slugs still exist/are active; provide graceful fallback if an admin deactivates a selected track.

**Freshness contract:** Adopt a targeted Supabase Realtime subscription for content tables (if supported/configured) plus query invalidation on foreground/focus; alternatively prove a focus/refetch strategy meets the handbook's stricter “while user is on the screen” challenge-edit requirement. One admin edit must update an open detail screen **without app restart, navigating away or releasing a new build**. Handle deletion/deactivation in place without flashing stale pro content. Query keys include user ID where data is user-owned; clear per-user caches on sign-out/account switch.

**Tests/exit gate:** Admin integration tests cover all CRUD, reorder and restore. Mobile tests show live content and loading/empty/error states. Manual staging run: edit a challenge and quote from the deployed admin site while each screen stays open; wording/order change appears, progress still belongs to the same challenge. Free account sees track names and quotes but not challenge details. Commit/push app + admin changes and deployment evidence.

## 7. Phase 3 — Tracker completed end to end

**Dashboard:** Keep the current contacts ring if it suits the approved UI, and add visible progress bars/ratios for **contacts, events and follow-ups** against per-week goals. Use the same `week_key` for all three. Define zero-goal display (`0` target is “No goal set,” not divide by zero); cap visual fill at 100% while allowing actual count to exceed target. Refetch at local midnight and ISO week boundary without requiring app restart. Eight consecutive ISO weeks appear oldest-to-newest with zero-activity weeks included; bar total includes durable challenge completion rows once Phase 1 migration is live. Make chart labels meaningful around year rollover, and keep accessible text for bars/ring.

**Forms (`LogActivityScreen.tsx`, `LogEntryScreen.tsx`, `services/supabase/activity.ts`):** Contact log offers either a directory record (persist `contact_id`, prefill title) or manual name (null `contact_id`); free users can log manual contacts without querying gated directory. Event log takes event name, selected date/time in user's timezone and optional notes; follow-up takes a clear person/action title, optionally a directory contact if permitted, and notes. For all three, validate nonempty title/valid date, prevent duplicate submits, preserve draft on failed save, derive `week_key` from the chosen date at **creation** and persist it. If a user can choose a past event date, state how an edited event date updates its `week_key`; otherwise no edit UI. Reuse Week 2's “Mark as contacted” path without duplicate entries.

**Goals:** One nonnegative integer per type per ISO week, default/carry forward from the latest earlier week unless explicitly set. A saved zero remains zero and is not treated as missing. Show the same effective goal across dashboard/editor; changing this week must not rewrite prior weeks. Tests must cover year rollover and local Monday midnight just before/after.

**History:** Render all persisted manual + challenge activity newest first and grouped by persisted week. Implement swipe-to-delete for manual rows with a confirm/undo affordance, loading/error feedback, and durable deletion. Challenge rows are read-only in history or route to the challenge control (per Phase 1 invariant). Remove title-based synthetic dedupe from `useTrackerEntries.ts`. Invalidate activity, chart, goal progress and history after every insert/delete/challenge transition; verify background/foreground and relaunch. Do not optimistically claim success until the server write succeeds, or roll back visibly on failure.

**Tests/exit gate:** Unit tests for ISO/timezone, zero goals, eight-week gaps, count/target overflow and sorting; screen/integration tests for contact-linked and manual logging, event dates, network failure/retry, swipe deletion and the Week 2 contact-detail path. On a device, save each type, force-stop/reopen, see identical rows and counts, then delete one and verify it stays gone. Commit/push.

## 8. Phase 4 — Challenges and Inspiration completed

### 4A. Challenges

- Track picker loads the six currently active tracks at signup, requires ≥1 choice, persists `profiles.selected_tracks`, and Profile edits the same field later. Selected tracks are pinned, not duplicated, on the list; counts and progress ring use **active challenges only** and stable IDs. The exact count can vary from the seeded six if admins add/deactivate content; avoid hardcoded array lengths.
- `single`: tap incomplete → complete with server timestamp/completion activity; tap complete → incomplete and remove linked activity. `counter`: increment/decrement within `[0,target]`; automatic completion only at target, one activity row; decrement below target removes it; increment after target has no effect. Notes save independently without triggering an activity. Handle rapid taps and two devices with serialized/atomic server transitions and a clear pending state.
- After admin edits `title`, `description`, `target` or order mid-session, detail updates in place, old progress remains attached. Define target-change semantics: clamp count to new target and recompute completion via the same atomic transition, or require admin confirmation of a change that would affect in-progress users. Test the chosen rule. Track deactivation hides the track from active selection but preserves user data.
- Navigation/paywall: free users may browse track names/counts allowed by RLS; tapping locked detail opens the real paywall. After purchase and entitlement propagation, return to the originally requested detail, not an unrelated tab.

### 4B. Inspiration

- Query `quotes` with `active=true` and deterministic `order,id` sorting. Compute daily featured quote from active server rows via `quoteOfTheDay`, and update it at **local midnight** while screen is open. All users in the same local calendar date must get the same selection for the same active set; the handbook's “every user sees the same one” conflicts with different local dates/timezones at a given UTC instant, so interpret it as *same local calendar date*, and record that rule in tests. Do not pin a hardcoded quote ID.
- Replace SecureStore-only favorites with owner-scoped Supabase rows. Migrate existing `savedQuotes.ts` IDs once per signed-in user, using idempotent insert/upsert, then use the server as the source of truth. Never import device A's saves into account B. Saved tab includes all saved active quotes, including any featured quote; allow save/unsave on **every** card. Test cross-device, logout/login and offline/error behavior. Decide whether locally cached saves are read-only offline or queued for sync and state it in UI.
- Render a branded `QuoteCard` to a bitmap (`react-native-view-shot` is one Expo-supported route) and open native image share (`expo-sharing` or equivalent); test the resulting file on Android/iOS, legibility on long quotes, author, logo/brand and cancellation without error. Text-only `Share.share` does not satisfy §4.5. Keep a fallback message only when the device cannot share files, not as the primary behavior.

**Tests/exit gate:** Challenge transition matrix, exactly-once durable history on both devices, target boundaries, note persistence, admin live edit, favorites migration and isolation, deterministic daily quote, and actual shared PNG/JPEG on-device. All run with seeded **database** content, not bundled mock content. Commit/push.

## 9. Phase 5 — Real products, mobile purchase UX and native builds

Follow the current [RevenueCat Expo guide](https://www.revenuecat.com/docs/getting-started/installation/expo): Expo Go can preview/mock SDK logic but **cannot prove real store purchases**; rebuild a native binary after adding `react-native-purchases`. A standalone Android APK built outside Play distribution may also be inadequate for Google Play Billing sandbox, so use the appropriate Play test track/build for acceptance. Keep a standalone APK for general app testing if useful, but label it separately from billing evidence.

1. Configure one `pro` entitlement in RevenueCat, two store products/base plans—monthly and annual—and one current offering with corresponding packages. Connect each platform app and store; product IDs/bundle/package IDs must match exactly. Configure a trial only if the store product truly has one. Document external setup in a private checklist, with no secrets in Git. Start with RevenueCat Test Store for developer loops if needed, then switch to **platform-specific public keys and real platform sandboxes** for the Week 3 gate. [RevenueCat's testing guide](https://www.revenuecat.com/docs/test-and-launch/sandbox) distinguishes these stages.
2. Add the SDK with an Expo-compatible pinned version and rebuild Android/iOS. Configure it only when Supabase has an authenticated user and use that user's immutable **Supabase UUID** as RevenueCat App User ID. Never use email, display name, a shared hardcoded ID or a value the user can edit. On account switch, identify the new UUID and clear prior account billing/query state; on sign-out, clear all app premium UI. Explicitly test RevenueCat alias/transfer policy so a restored purchase cannot accidentally unlock a different Supabase account. [Identity guide](https://www.revenuecat.com/docs/customers/identifying-customers), [restore behavior](https://www.revenuecat.com/docs/getting-started/restoring-purchases).
3. `PaywallScreen.tsx` loads `getOfferings()` and renders current localized store prices, interval, optional trial/intro terms and real savings derived from products. Loading, no-offering, offline, store-unavailable and purchase-in-progress states have clear copy. Keep two selectable cards when two packages are configured. Do not silently present a different plan if one product is missing. Display terms/privacy links and recurring-billing information appropriate to store review.
4. Purchase selected package, handle user cancellation separately from errors, call Restore explicitly, and show a “Confirming access…” state while the server entitlement catches up. `CustomerInfo` is a UX signal; gated DB access becomes available only after Phase 6 server reconciliation. Provide retry/refresh if webhook lag exceeds a short timeout. No `setIsPro(true)` solely on SDK callback. Preserve the locked destination so successful purchase returns to it.
5. Show current plan, active/trial/cancelled-but-still-active/expired state, renewal or end date, and platform-specific “manage/cancel in store” guidance in Profile. Read status from the server-owned subscription state, with RevenueCat metadata only as supplementary display after identity check. No fake “Activate Premium (test)” path in production or platform-sandbox acceptance.

**Tests/exit gate:** Mock SDK contract tests for offerings/selection, purchase cancellation/error, restore, account switch, and no hardcoded price. Build native Android and iOS binaries containing the SDK; demonstrate offerings visible on both. This phase can finish before actual sandbox purchase, but cannot be called Week 3 complete. Commit/push.

## 10. Phase 6 — Webhook, entitlement reconciliation and RLS cutover

**Backend:** Create a RevenueCat webhook Edge Function in `supabase/functions/` and configure only that function to accept external unauthenticated HTTP at the platform layer (`verify_jwt=false`). Authenticate **inside** using RevenueCat's configured Authorization header and, if enabled, its HMAC signature over the **raw body** with timestamp/replay protection; reject missing/wrong credentials before any secret-key database operation. Verify expected RevenueCat project/app ID, entitlement ID and environment. Secrets live in Supabase's server secret store. RevenueCat documents duplicate delivery, retries and potentially delayed cancellation, so persist unique webhook event IDs and process idempotently; log safely without receipts, tokens or raw personal data. [RevenueCat webhooks](https://www.revenuecat.com/docs/integrations/webhooks), [event fields](https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields), [Supabase webhook function configuration](https://supabase.com/docs/guides/functions/function-configuration).

**State model:** Use a server-owned subscription record/receipt ledger keyed to Supabase UUID and purchase lineage, with source platform, product, environment, active-until date, auto-renew/cancellation information, last reconciled time and event IDs. Keep `profile_entitlements.is_admin` untouched. Recompute `is_pro`/subscription display from authoritative active entitlement state, including expiry, transfer, refund, billing grace and restoration. `CANCELLATION` normally means auto-renew is off **but access remains until paid period end**; `EXPIRATION`/revocation removes access as appropriate. Do not make a late duplicate/out-of-order webhook regress a newer active state; serialize per subscriber or compare authoritative timestamps/RevenueCat subscriber state. Map `app_user_id`, `original_app_user_id` and aliases carefully; unknown or ambiguous identity is quarantined for review, never assigned to an arbitrary user. Avoid trusting mutable `user_metadata` for authorization. [RevenueCat lifecycle events](https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields).

**Reconciliation:** On purchase/restore, provide a user-authenticated server reconciliation request that verifies the requesting Supabase JWT and queries the RevenueCat subscriber API using a server-held key, or waits/retries for webhook completion. It must reconcile only the caller's UUID and be rate-limited/idempotent; it cannot accept an arbitrary “is premium” boolean. This closes the UX gap when webhooks arrive 5–60 seconds later or are retried. Schedule/trigger periodic expiry reconciliation so stale `is_pro=true` cannot survive missed expiration webhooks; keep it cheap and observable. On app launch/foreground, refresh server entitlement and invalidate gated queries; revoke the cached premium display and data promptly after expiry or account switch.

**Preview cutover:** Disable `app_config.test_purchases_enabled` before sandbox acceptance on the billing environment; remove or confine `activate_preview_plan` to isolated development only. Audit all existing `test_pro=true` rows and ensure no free-test grant is treated as a paid entitlement. A production build must have **no runtime path** that calls the preview RPC, including `__DEV__`-based accidental activation on a testing build. Keep `is_pro()` fail-closed and derived from server-owned paid state. Use a reversible, explicit migration for preview cleanup, not manual ad hoc edits.

**RLS/security tests:** Free users: read categories/tracks/quotes but zero contact/challenge-detail rows; pro users: read gated content; pro status does not grant admin CRUD; admin can manage content without purchasing; user A cannot read/write B's activity/progress/saves; user cannot update entitlement/ledger; forged webhook/incorrect app ID/sandbox-to-production event cannot grant access. Test cancellation with access through paid period, expiration/transfer/refund removing access, event replay, out-of-order events, network outage/retry, and foreground refresh. Run Supabase security/performance advisors and inspect any new exposed-table grants. **Exit gate:** a real sandbox purchase causes RevenueCat → authenticated webhook/reconciliation → server state → `is_pro()`/RLS to grant access, with no preview switch. Commit/push.

## 11. Phase 7 — Cross-platform E2E, regression and acceptance artefacts

Use fresh test accounts and **actual platform sandboxes**, not a mocked product. For Android, follow [RevenueCat's Google Play sandbox checklist](https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store): license tester, test track/approved available release and the same Play account on device. For iOS, follow [RevenueCat's Apple sandbox guide](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store): App Store Connect product/store setup, sandbox tester and an iOS device/TestFlight-capable build. Record the RevenueCat sandbox transaction and matching sanitized Supabase entitlement row; do not paste account passwords or payment artifacts in the report.

| Scenario | Required observable result |
|---|---|
| New account on each platform | Signup, track selection, paywall; monthly **and** annual offerings show correct store-derived prices/periods and configured trial terms. |
| Monthly purchase; separate annual purchase/test account | Native purchase sheet succeeds; RevenueCat transaction appears; webhook/reconciliation stores paid state; RLS lets account read contacts and challenge detail; Profile shows correct plan/status/date. |
| Free/locked path before purchase | Category counts, track names and quotes visible; contact list and challenge detail locked; direct Supabase query cannot bypass lock. |
| Restore on reinstall/second device | Same Supabase user recovers purchase and server gate; wrong Supabase user does not inherit access by shared device or stale cache. |
| Cancel and expire | Cancel retains access until paid-through; expiration/revocation removes gated access by next launch at latest; foreground refresh does not show stale premium. |
| Challenge single and counter | One completion activity appears in history/8-week total; untick/decrement removes exact row; changing wording/order in admin keeps progress and no duplicate history. |
| Tracker three types | Linked/manual contact, dated event and follow-up persist across relaunch; three goals/bars, zero-goal behavior, eight-week chart and swipe delete are correct. |
| Inspiration/admin live edits | Quote of day rotates at local midnight, all active quotes are saveable, saves sync across devices, image share works, admin content edits appear on open screens. |
| Failure paths | Offline/no offering, purchase cancellation, restore with no purchase, webhook retry, duplicate event and auth/account switch give correct non-premium or informative states. |

Run mobile unit/component/type tests, admin tests/typecheck/build, SQL/RLS tests and an end-to-end physical-device checklist. Regress Week 1–2 auth/directory/admin contacts and A–Z jump. Record exact commands, test counts, two platform build IDs, screenshots/screen recordings, test-account UUIDs (not credentials), sanitized purchase event IDs and any blocked step. Then deploy the latest admin changes, verify its deployed version, commit the evidence/doc updates and push `main`.

**Final acceptance gate:** All rows above pass on both platforms and the handbook's fresh-account journey works end to end. If one row is not exercised, mark it **untested**, not passed. If Apple store access or product approval is missing, the coding agent should finish safe implementation and Android/Test Store verification, report the precise external prerequisite, and leave Week 3 open.

## 12. Risk register and rollback discipline

| Risk | Control / rollback |
|---|---|
| Existing challenge progress keyed by order | Backfill stable `challenge_id`; verify counts and keep reorder disabled until all active app versions use ID. Preserve old columns during rollout. |
| Duplicate or orphan challenge history | Atomic transition, unique link, one-time backfill, 1:1 invariant query; remove synthetic entries only after validation. |
| Store webhook delay or loss | Server reconciliation after purchase/restore, event-id ledger, retry handling and periodic expiry sweep; do not grant from client optimism. |
| Free premium preview leaking into paid acceptance | Isolate/disable preview flag and RPC for billing environment; prove a free user is denied by RLS before purchase. |
| Sandbox purchase granting production access | Environment filter, separate test project where possible, explicit production cutover check. |
| RevenueCat account alias/transfer mistakes | Supabase UUID identity and explicit restore/transfer policy; test account switching and second-device restore. |
| Admin reorders colliding with unique order | Atomic full-list reorder with constraints and concurrency test; rollback transaction on failure. |
| Live content subscription drift | Targeted invalidation and on-focus refresh; manual open-screen edit test. |
| Week 2 regression | Run existing suite and device smoke after every phase; each phase is a separate pushed commit to permit a targeted revert. Database rollback is **forward fix** with preserved data, not destructive reset. |

## 13. Source references for the coding agent

- Product requirements: [Developer Handbook](Entertainment-Power-Developer-Handbook.md) §3, §4.3–4.6, §5, §6 Week 3, §7; prior scope decisions in [Week 2 plan](week2-implementation-plan.md).
- Current backend: `supabase/migrations/`, `supabase/config.toml`, `supabase/tests/`, `supabase/functions/`; [Supabase RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security), [Edge Function security](https://supabase.com/docs/guides/functions/auth), [function configuration](https://supabase.com/docs/guides/functions/function-configuration).
- Purchases: [RevenueCat Expo](https://www.revenuecat.com/docs/getting-started/installation/expo), [sandbox stages](https://www.revenuecat.com/docs/test-and-launch/sandbox), [customer identity](https://www.revenuecat.com/docs/customers/identifying-customers), [restores](https://www.revenuecat.com/docs/getting-started/restoring-purchases), [webhook security/retries](https://www.revenuecat.com/docs/integrations/webhooks), [event fields](https://www.revenuecat.com/docs/integrations/webhooks/event-types-and-fields).
- Branded image share implementation options: [Expo view capture](https://docs.expo.dev/versions/latest/sdk/captureRef/) and [Expo Sharing](https://docs.expo.dev/versions/latest/sdk/sharing/).

Documentation/API behavior changes. Recheck official docs and project dashboards at implementation time; the plan fixes product outcomes and safety gates, not unverified SDK method signatures.
