# Entertainment Power Players — Full Project Handoff

**Read this entire file before touching anything.** It exists because Bilal is moving to a new laptop, and the chat history / session context that previously held all of this project's context will not carry over. This document is written to replace that context completely — if you are a fresh Claude Code session reading this with no prior memory of the project, this file should bring you fully up to speed: what the product is, what has been built, what decisions were made and why, what is currently broken or unfinished, and what to do next.

Treat this as authoritative but **verify live state before acting on anything time-sensitive** (git log, `supabase db query`, live app behavior) — this document is a snapshot as of **31 October 2026**, and code/data moves faster than docs. Where this file says "currently," that means as of that date. Cross-reference the other docs in `docs/` for deeper detail on specific phases; this file is the map, not a replacement for them.

---

## 1. What this project is

**Entertainment Power Players** is a subscription mobile app for people building a career in the entertainment industry, plus a web admin panel to manage its content. It is a real, paying client project — not a personal or demo app. Bilal is the sole developer; there is a "supervisor" who relays feedback from the client and periodically sends numbered checklists to verify against, and there is a client (end customer paying for the build) who has not yet supplied most of the real content (questions, quotes) or store credentials.

### The product, in the client's own words (from the original handbook)

Four pillars:
1. **Directory** — an alphabetized contact directory across industry categories (currently 5: Fashion, Film/TV, Gaming, Music, Sports). Real industry contacts — castings directors, agents, A&R managers, etc. **Never fabricate or render photos for these people** — this has been a hard rule since Week 1: contacts show initials/category icons only, never invented headshots, because these represent real people and a fake photo would be misleading.
2. **Tracker** — a weekly log of contacts made, events attended, and follow-ups, against goals, with an 8-week trend chart.
3. **Challenges** — career-action tracks (currently 6: the 5 categories plus Creators+Producers) the user works through and ticks off, using "Power Move" language throughout.
4. **Inspiration / Quotes** — a feed of industry quotes, one featured per day, no repeat for a member within the trailing 32 weeks (224 days).

Directory contact details and challenge details are paywalled (Pro/paid only). Category names, track names, and quotes are free to browse.

**Everything in the app is meant to be admin-editable at runtime** — no contact, quote, challenge, or category is meant to be hardcoded in the app bundle. This is a foundational design principle, not a nice-to-have: the admin panel is a first-class deliverable, not an afterthought.

### Later-added scope: "Power Moves" Questions module

Partway through the project (supervisor sprint, early October), a new feature was added that is **not in the original handbook** — a "Power Moves" questions module: `question → answer → why → power_move`, organized by category and "challenge group," with 125 questions promised by the client (not yet delivered — see §7). This became its own bottom tab in the most recent restructure (§6).

---

## 2. Architecture — current, verified state

- **Mobile app**: React Native 0.86.3 / Expo SDK 57 (TypeScript, strict). `apps/mobile/`.
- **Admin panel**: React + Vite + TypeScript. `apps/admin/`. Deployed to **Vercel**.
- **Backend**: **Supabase** (Postgres + RLS + Edge Functions + Auth). Project ref `knrjhmrsuyzzxlverryl`, region `eu-central-1`, named `entertainment-power-players`.
- **Billing**: RevenueCat, wired to Supabase via an authenticated webhook + reconciliation Edge Function.
- **Navigation**: React Navigation (bottom-tabs + native-stack).
- **Server state**: TanStack Query. **Local state**: Zustand (one store per feature area — `useAuthStore`, `useAppStore`).
- **Forms**: React Hook Form + Zod (per original spec; not heavily audited this pass).
- **Charts**: a small **custom** flexbox `BarChart` component, NOT Victory Native as the original handbook specified — Victory Native's current major version drags in Skia + Reanimated + gesture-handler, judged not worth the native-config fragility for a static 8-week bar chart. This is a deliberate, documented substitution (see `docs/week1-acceptance.md`).

### CRITICAL historical fact: this project was NOT always on Supabase

**The original developer handbook (`docs/Entertainment-Power-Developer-Handbook.md`) specifies Firebase throughout** — Firestore, Firebase Auth, Cloud Functions, Firebase Hosting. **Do not be confused by this file's Firebase terminology** — it is historical. The project was built against a live Firebase project in Week 1, but Firebase's 2nd-gen Cloud Functions require the paid Blaze plan to deploy at all (confirmed by an actual failed deploy attempt, not just reading docs). Supabase's free tier includes Edge Functions with no card required and explicitly permits commercial use for free. The client approved the switch; **the Firebase project was deleted**. Everything since has been built on Supabase.

**When reading the handbook, mentally substitute**: Firestore → Postgres+RLS, Cloud Functions → Edge Functions, Firebase Auth → Supabase Auth, Firebase Hosting → Vercel (admin only), custom claims (`pro`/`admin`) → `profile_entitlements` table read by RLS policies. The *product/behavior* spec in the handbook (§4 screen behavior, §6 weekly targets, §7 QA checklist) is still the source of truth — only the *infrastructure* changed.

Every later planning doc (`week2-implementation-plan.md`, `week3-implementation-plan.md`, the supervisor sprint plan) explicitly reaffirms: **Supabase + Vercel + Expo/EAS is the current, permanent architecture.** Nobody is asking to migrate back to Firebase. Treat any Firebase reference in old docs/comments as historical record only.

### Entitlement model (important, non-obvious)

Entitlement (`is_pro`) is **never decided client-side**. It's read by Postgres RLS policies calling a `is_pro()` SQL function. **This function has been rewritten at least once during the project** — originally it read a simple `profile_entitlements.is_pro` boolean column; it was later rewritten (during Week 3 billing work) to instead check `subscription_status.state in ('trial','active','cancelled') and active_until > now()`. **If you ever need to grant/check Pro status for testing, query `subscription_status`, not `profile_entitlements.is_pro`** — the latter is now vestigial for Pro purposes (it's still used for `is_admin`). This bit a debugging session hard on 30 October 2026 — see §9 for the full story, it's worth reading if you're ever confused about why a test account seems locked despite looking "Pro" in one table.

### Repo layout

```
docs/                    Specs, build logs, plans, CSV templates, UI reference images
apps/mobile/              Expo app
apps/admin/                React + Vite admin panel, deployed to Vercel
supabase/
  migrations/             19 migrations as of 31 Oct 2026, applied in order to the live project
  functions/               Edge Functions: import-contacts-csv, delete-account,
                            revenuecat-webhook, reconcile-subscription, _shared
  seed.sql                Original seed content
  cutovers/                Manual (non-migration) SQL for the paid-billing cutover —
                            NOT YET RUN, see §7
```

### Local tooling directories — do not touch, do not commit

`.agents/`, `.aider-desk/`, `.claude/`, `data/`, `skills-lock.json` sit untracked at the repo root across many sessions. They are local AI-tooling scaffolding, not part of the product. Every past session has been explicitly instructed to leave them alone and never stage them in a commit. Keep doing that.

---

## 3. How this project is actually run — working agreements, established over many sessions

These are hard-won conventions. Follow them without being asked again.

1. **Work directly on `main`.** No feature branches for normal work (the one exception, `ui-revamp`, was an explicit full-redesign experiment that was built out then **fully reverted** — see §5. It still exists as a branch but is dead; `main` never merged it).
2. **Commit and push only when explicitly asked.** Never commit proactively. When asked, stage *only* the files relevant to the actual change — never bundle in the untouched local tooling dirs, never bundle in unrelated pre-existing uncommitted changes that happen to be sitting in the working tree from something else.
3. **Every phase of work ends in: typecheck clean → full test suite green → (if asked) commit → push.** "Code compiles" and "a mock test passed" are explicitly **not** the same as "done" — see the supervisor plan's own language: *"A test is passed only with observed result and evidence; 'code exists,' 'build succeeded,' and 'mock test passed' are separate statuses."*
4. **Never claim a visual/UI change is correct without actually looking at a screenshot.** This was learned the hard way during the UI revamp attempt — see §5.
5. **Never claim a database-dependent feature works without actually querying live data or driving the real UI.** This was learned the hard way during the Oct 30 "is it demo-ready" investigation — see §9.
6. **Security: never use a credential pasted into chat.** Bilal once pasted a live Supabase access token directly into a chat message and repeatedly insisted it be used directly to bypass an MCP auth problem. The correct, followed response was to refuse every time, explain there is no mechanism to accept a bare token that way, and tell him to revoke it in the dashboard. He then fixed the actual problem himself via `supabase login` in his own terminal. **If this situation recurs — a credential appears in chat — do not use it. Tell the user to revoke/rotate it and resolve access through a proper channel** (`supabase login`, `/mcp` reauth, etc.).
7. **Disk space runs out repeatedly on this machine.** It has filled to 95-97% full multiple times across sessions, degrading Playwright/Chrome test reliability (random closes, flaky network-feeling errors that are actually disk/memory pressure). You are authorized to clear safe, regenerable caches (`~/.npm/_cacache`, `~/.cache/dotslash`, `~/.cache/pip`, `~/.cache/deno`, `~/.cache/uv`, `~/.cache/node-gyp`, stale scratchpad session dirs under `/tmp/claude-1000/...`) without asking each time. **Never touch `~/.cache/google-chrome`** — that's Bilal's real, actively-open browser profile, not a test artifact (confirmed by process start time predating any test run). Never use `sudo`-requiring destructive operations without asking first.
8. **Risky/shared-state database actions go through a permission gate, correctly.** Restoring a paused Supabase project, inserting into the real `subscription_status` table, and similar actions have been correctly blocked by the permission system pending explicit user sign-off — even when done for legitimate test-verification purposes. Respect these blocks; ask, don't route around them. (Once approved, they're fine to do — see §9 for an example of a sanctioned temporary test-entitlement insert that was cleanly reverted afterward.)
9. **MCP Supabase tools have been unauthorized for the entire project history across many sessions** (`mcp__supabase__*` consistently returns "Unauthorized. Please provide a valid access token..."). The **Supabase CLI** (`supabase db query "..." --linked`, run from the repo root) has been the reliable fallback and is already authenticated on this machine as of the last session. If CLI auth is ever lost, `supabase login` in the user's own terminal is what has fixed it before (user action, not something to attempt on their behalf with a pasted token — see point 6).
10. **The project's Supabase instance can auto-pause from inactivity** (free-tier behavior). If `supabase link`/`db query` reports "project is paused," that's not an auth bug — someone with dashboard access needs to restore it, or the `mcp__supabase__restore_project` tool can do it, but that action is gated behind explicit user permission (point 8) since it affects shared production infrastructure.

---

## 4. The handbook's 4-week plan vs. what actually happened

The original handbook laid out 4 weeks. Reality diverged significantly — not through dropped scope, but through *added* scope (a client-driven visual-redesign sprint inserted mid-project) and a slower, more thoroughly-tested pace per phase than a literal calendar week. Here is the real timeline:

### Week 1 — Foundations & Design: **COMPLETE**
Firebase→Supabase migration happened here (see §2). Schema + RLS deployed, 12 tables, security/performance advisories clean, real seed data, CSV import Edge Function deployed and verified end-to-end against the live project. Full detail: `docs/week1-acceptance.md`.

### Week 2 — Auth, Directory, Admin Panel: **COMPLETE**
Email/password + Google auth wired for real (Apple deferred — no Developer account yet, a decision that has held for the entire project since). Directory wired to live Supabase data: category grid with real counts via a `security definer` RPC (so free users see counts without leaking pro-gated row data), A–Z jump bar that actually scrolls, debounced search, role/city filters, favorites, "mark as contacted." Admin panel built from scratch (`apps/admin/` was an empty placeholder before this week) — login/claim-check, contacts CRUD with soft-delete, CSV bulk upload with column mapping/preview/per-row error reporting, categories UI, deployed to Vercel. A real RLS gap was found and fixed during live verification (admin accounts that weren't also Pro subscribers couldn't SELECT contacts they'd just inserted — fixed in `20260914000001_admin_read_contacts.sql`). Full detail: `docs/week2-implementation-plan.md` (unusually thorough — it quotes the handbook verbatim per-requirement rather than paraphrasing, worth reading if you need exact original wording for anything Directory/Admin-related).

### Week 3 — Tracker, Challenges, Inspiration, Subscriptions: **MOSTLY COMPLETE, with one explicitly-accepted risk**
This was the biggest, most carefully executed phase — an extremely detailed implementation plan (`docs/week3-implementation-plan.md`, 202 lines) was written *before* building, with an explicit warning against declaring victory on mocks/simulators/Test Store purchases alone. The build log (`docs/week3-build-log.md`) tracks 7 phases (0 through 6) plus later addenda, each with real commit SHAs, test counts, and an honest "not yet complete because X" note at nearly every checkpoint — this is a good model to follow for future work logs.

What's real and done:
- Tracker: dashboard with 3 goal bars, all 3 log types (contact/event/follow-up), 8-week chart, swipe-delete history, atomic week-key handling.
- Challenges: stable challenge IDs (migrated off fragile order-based identity), atomic single/counter transition RPC, durable activity write-through, admin reorder (though the reorder *feature flag* stays off until old-order-based APKs are fully retired — check `app_config.challenge_reorder_enabled` before assuming reorder is live).
- Inspiration: live quotes, deterministic quote-of-the-day, server-owned `quote_favorites`, branded PNG share via `react-native-view-shot` + `expo-sharing` (not just text share).
- Billing: RevenueCat SDK wired, UUID-based identity (not email), paywall reads real store offerings, webhook + reconciliation Edge Functions deployed and live on the EPP project, server-owned `subscription_status` table is the single source of truth for `is_pro()`.

**The one accepted risk (2026-10-15 decision, Bilal's explicit call, documented in the build log)**: no real platform-sandbox or real-money purchase has been tested. Bilal personally tested a **RevenueCat Test Store** purchase (confirmed genuine, on a real compiled native build — not Expo Go, which would crash on the native billing module) which exercised the entire real pipeline end-to-end (`PaywallScreen → purchase → webhook → is_pro() → RLS-gated content`) short of an actual platform (Apple/Google) sandbox transaction. He explicitly declined to spend real money or do free platform-sandbox testing himself, and the decision was: **the client's first real purchase after submission is accepted as the real end-to-end billing test.** This is documented, not silently skipped — read the two addenda at the bottom of `week3-build-log.md` for the exact reasoning and the submission-time cutover plan (swap Test Store keys for real platform keys in `.env`, no code changes needed, then run `supabase/cutovers/week3_paid_entitlement.sql` once a real purchase succeeds).

### Week 4 — Hardening & Submission: **NOT STARTED as its own phase**
This is important: **the handbook's literal "Week 4" (full QA pass, store screenshots/listing copy, signed builds submitted to both stores) has not begun.** What *has* happened instead is a separate, later, client-driven redesign sprint (next section) that consumed significant time and produced most of what Week 4 would have needed visually, but did not submit anything to app stores. Don't confuse the Oct 3–9 supervisor sprint with "Week 4" — they're different scopes that happen to overlap in timing.

---

## 5. The supervisor Oct 3–9 sprint — a separate, later engagement

Partway through (after Week 3's code-level work was mostly done but before full device acceptance), the **supervisor** sent Bilal a seven-day visual-redesign brief, quoted in full and planned in extraordinary detail across two docs: `docs/supervisor-oct-3-9-implementation-plan.md` (819 lines — the most thorough planning doc in this repo) and `docs/supervisor-oct-3-9-execution-log.md` (105 lines, the actual work log against that plan).

### What the supervisor asked for (verbatim themes, 2 Oct feedback)
- White/light theme everywhere (previously the app had a **dark** theme — near-black surfaces, "Aurora" glow components, dark navigation).
- Clean contemporary sans serif (Inter — already in use, kept).
- Centered/symmetrical layout everywhere.
- Logo moved lower, closer to the wordmark.
- `®` after "ENTERTAINMENT POWER PLAYERS" on every screen it appears.
- Larger, more legible button text.
- **No images of real people anywhere** — this reinforced and extended the existing "no fake contact photos" rule to cover onboarding art too (there was a concert-crowd stock photo on the first onboarding slide — removed) and any user-uploaded profile photo rendering (now always shows initials/icon instead, even if a `photo_url` exists in the data).
- Sunglasses for Fashion, basketball for Sports (previously generic glasses/trophy-or-football icons, inconsistently mapped).
- Category icons only for contacts, never photos (already true, reinforced).
- Bottom tab bar: **four tabs — Home, Power Moves, Challenges, Search** with house/lightning-bolt/trophy/magnifying-glass icons (previously 5 tabs: Directory, Tracker, Challenges, Inspiration, Profile — **this specific item was not actually implemented until 30–31 October**, see §6, well after the rest of this sprint's visual work).
- Plus the Power Moves questions module, 225-quote rotation, admin contacts delete semantics, subscription (no free trial), auth, and a fresh APK/iOS build — i.e. essentially the same list later re-sent as a 26-item numbered checklist (see §6).

### What actually happened during this sprint (abbreviated — read the execution log for full detail)
A near-complete light-theme conversion of the whole app: `Aurora` dark-glow component deleted entirely, all theme tokens rewritten to a white/light palette, Inter typography sizes corrected, category icon resolver rewritten to a stable-slug→canonical-icon mapping (sunglasses/basketball among others) independent of whatever junk is in the database `icon` column, `®` added everywhere via an automated contract test, admin panel given matching light CSS and deployed live to Vercel. A genuine bug was found and fixed along the way (an SVG chart that collapsed to a vertical sliver on a real phone — a Yoga/React-Native-Web shrink-wrap issue masked by the web renderer during testing). **Bilal approved the visual result in Expo Go on 5 October 2026** — this is the one explicit real-device visual sign-off recorded in this sprint; nearly everything else in the execution log is careful to say "browser/synthetic preview, not a native device test."

**What was explicitly left open at the end of this sprint** (per the execution log's own "Not done" sections): authenticated admin CRUD on the deployed site wasn't fully re-verified post-deploy, no Android device/emulator or iOS toolchain was ever attached to actually test native behavior (clean install, keyboard, safe-area, large-font, system-dark, reduced-motion), and a few minor cosmetic leftovers (track names reading "Film + TV" vs the category's "Film/TV", left-aligned admin headers).

**A stray test artifact needs cleanup**: a `QA-TEST Contact 582406` was left `active` in the live contacts table during this sprint's admin verification, explicitly flagged in `docs/phase2-route-qa-matrix.md` as needing removal before delivery. **Check if this is still in the live database and remove it if so** — this was never confirmed cleaned up in any later doc.

### The UI revamp branch — built, then fully reverted (important: do not resurrect without asking)
Separately from the supervisor's light-theme sprint, there was an earlier attempt at a **different, much more literal pixel-accurate dark-theme redesign** driven directly by client-supplied mockup images (`docs/ui-*.png/jpg/jpeg`), documented exhaustively in `docs/HANDOFF_UI_REVAMP.md`. This got partway through (9 of 24 screens) on a branch called `ui-revamp`, with an extremely rigorous "extract mockup → sample real pixel colors/positions → build → screenshot-compare side-by-side → fix → repeat" methodology that is genuinely worth reading if a similar from-mockup-images task ever comes up again — the method itself is sound even though this particular attempt was abandoned.

**This was explicitly reverted** — Bilal said "push ourselves back to the prev codebase," and since nothing had been committed to `main` from it, a `git restore` cleanly undid it. The `ui-revamp` branch still exists in git (`git branch -a` shows it) but `main` never merged it and the current app is NOT in that dark-mockup style — it's in the white/light style from the supervisor sprint described above. **Do not assume `docs/ui-*.png` images or `HANDOFF_UI_REVAMP.md` describe the current app** — they describe an abandoned direction. Keep them for historical reference only, per that file's own content.

---

## 6. Most recent work (this session, 29–31 October 2026) — the 4-tab restructure and supervisor checklist cycle

This is the most recent, most directly relevant history. The supervisor sent a 26-item numbered checklist (quoted in full in prior chat, re-derivable from §7 below if needed) asking Bilal to confirm done/not-done/half-done against the original Oct 2 brief. This triggered a real, careful verification pass (not just trusting old docs) and then real fixes for the genuine gaps found.

### What was verified true already (no code changes needed)
White theme, Inter font, centering, logo/wordmark spacing, `®` everywhere, large button text (18px, confirmed in `typography.ts`), no real people images, category-icons-only — all confirmed via the existing automated `lightThemeContract.test.ts` suite (6 tests, all passing) plus live Playwright screenshots. Directory's 5-category count, A-Z list/search/filters/favorites/contact-detail/tap-to-call-email-web all confirmed via code read + live click-through. Tracker's full feature set confirmed. Challenges' 6-tracks-×-10-each and the two named counter-challenge examples ("Attend 5 Events", "Find 3 POWER PLAYERS") confirmed by name in the seed JSON. Questions' 4-field data model (`question/answer/why/power_move`) confirmed in the live-applied migration. Quote rotation's 224-day exclusion window confirmed by exact code inspection (`- 224` in the SQL). Subscription's monthly/annual-only (no trial type exists in the TypeScript type system at all) and restore-purchases confirmed. Auth confirmed real (not stubs) for email/password, Google, forgot-password, delete-account — **Apple sign-in confirmed as a real, intentional placeholder** (`handleAppleLogin()` just sets a "not available yet" notice; there's even a dedicated test `applePlaceholder.test.tsx` pinning this as expected behavior, not an oversight). Firebase vs Supabase confirmed definitively: zero Firebase references anywhere in either app's source or dependencies.

### What was found genuinely wrong and then fixed, this session
1. **Tab bar was still 5 tabs** (Directory/Tracker/Challenges/Inspiration/Profile) with the wrong names/icons, not matching the client's explicit 4-tab ask from nearly a month earlier. This was the single biggest, most clearly-wrong item on the whole checklist.
2. **Fashion/Sports icons** were a hanger and a trophy (from an earlier general "characterize, don't be generic" pass that wasn't actually matched to the client's specific literal request) — client explicitly asked for sunglasses and basketball.
3. **Questions admin page** only had CSV import, no manual add/edit/deactivate/restore UI like Contacts/Quotes/Challenges all have.
4. **225 quotes**: only ~5-6 placeholder quotes were live; Bilal had a real client-provided CSV sitting unused in `docs/EPP-Power-Quotes-for-dev.csv` the whole time.

### How each was fixed

**Tab bar restructure** (biggest change): Collapsed 5 tabs into the client's exact 4 — **Home, Power Moves, Challenges, Search** — with house/lightning-bolt/trophy/magnifying-glass icons (`home-outline`, `lightning-bolt-outline`, `trophy-outline`, `magnify` in MaterialCommunityIcons — all verified to exist exactly as named, no substitutions needed). Since Tracker, Inspiration, and Profile don't map to any of the 4 client-named tabs, they were folded in rather than dropped:
- **Home** became a real dashboard (greeting, weekly tracker summary, quick-access tiles) and also now hosts Tracker's full stack (dashboard/log-activity/log-entry/goals/history) and Inspiration's QuoteFeed, all as same-stack screens reachable from Home's quick-access tiles.
- **Profile** is no longer a tab — it's reachable via a tappable avatar in the Home header (`navigation.navigate('ProfileHome')`, same-stack).
- **Power Moves** became its own tab/stack hosting the Questions screens (moved from `src/features/challenges/` to a new `src/features/questions/` directory — they used to live oddly nested inside the Challenges feature folder even though conceptually separate).
- **Search** is the renamed Directory stack (CategoryGrid → ContactList → ContactDetail).
- **Challenges** stays as its own tab, now containing *only* TrackList/TrackDetail/ChallengeDetail (Questions moved out to Power Moves).

New navigation files: `src/features/home/HomeNavigator.tsx`, `src/features/questions/PowerMovesNavigator.tsx`, `src/features/directory/SearchNavigator.tsx` (renamed from `DirectoryNavigator.tsx`). Deleted: `DirectoryNavigator.tsx` (old name), `TrackerNavigator.tsx`, `InspirationNavigator.tsx`, `ProfileNavigator.tsx`. The navigation types file (`src/navigation/types.ts`) was rewritten with new `HomeStackParamList`/`PowerMovesStackParamList`/`SearchStackParamList` replacing the old `DirectoryStackParamList`/`TrackerStackParamList`/`InspirationStackParamList`/`ProfileStackParamList`.

A real regression was caught and fixed during this restructure: `LogEntryScreen.tsx` called `navigation.popToTop()` after saving an activity, which used to correctly land on `TrackerDashboard` (old stack root) but would have silently landed on `Home` instead post-restructure (since Tracker moved inside the Home stack) — fixed to `navigation.popTo('TrackerDashboard')`, caught by `trackerActivityFlow.test.tsx` failing.

There's one known, low-severity, non-functional leftover from this restructure: React Navigation logs a console warning *"Found screens with the same name nested inside one another: Main > Home, Main > Home > Home"* — because the tab is named `Home` and its first screen is also named `Home`. Confirmed cosmetic (navigation works correctly in every tested path), but worth a quick rename cleanup later (e.g. rename the inner screen) if it keeps bothering you in logs.

**Icon swap**: `CategoryGlyph.tsx`'s icon map changed `fashion: 'hanger'` → `fashion: 'sunglasses'` and `sports: 'trophy'` → `sports: 'basketball'` (both exact MaterialCommunityIcons names, verified present in the installed glyph map before using).

**Questions admin CRUD**: new `apps/admin/src/pages/QuestionsPage.tsx`, mirroring the exact add/edit/deactivate/restore pattern already used by `QuotesPage.tsx`/`ContactsPage.tsx` — soft-delete only (`active: false`), no hard delete, consistent with the whole admin app's established convention (there is a code comment in `ContactsPage.tsx`: *"Deletes are soft — set active:false, never remove the row (handbook §3)."*). `/questions` route now points at this new CRUD page; the old CSV-only page moved to `/questions-import`, mirroring the existing `/quotes` + `/quotes-import` split.

**Quotes import**: the client's real CSV (`docs/EPP-Power-Quotes-for-dev.csv`) was parsed — it turned out to contain **exactly 223 quotes, not 225** (1 blank spacer row + 1 header row + 223 data rows, confirmed by direct row-count, not an estimate). Converted to the admin importer's expected column format (`text,author,order,category,source`) as `docs/EPP-Power-Quotes-import-ready.csv`, validated against the real importer's validation rules (zero errors, zero duplicate fingerprints), and inserted directly into the live database via a dry-run-then-commit SQL transaction through the Supabase CLI (the admin UI's import button requires an authenticated admin session which wasn't readily available at the time; the direct insert reproduces exactly what that button would do). **Live count is now 229 total quotes (6 old placeholders + 223 real ones), confirmed both via SQL and by seeing a real quote — "Give yourself a break." — The Late Lynda Obst — actually render in the live app's Quote Feed.** The client is still 2 quotes short of their own stated 225 target; this was reported back honestly rather than rounded up, and is a client-content gap, not an engineering one.

All of this was committed and pushed in commit `7610517` on `main`: *"Restructure to 4-tab nav (Home/Power Moves/Challenges/Search), swap Fashion/Sports icons, add Questions admin CRUD."* Verify `git log --oneline -1` shows this or later as HEAD before assuming any of the above is unmerged.

### Current, verified-live state as of 31 October 2026
- Mobile: `npx tsc --noEmit` clean, Jest **41 suites / 115 tests**, all passing.
- Admin: `npx tsc --noEmit` clean, Vitest **59 tests**, all passing, production build passes.
- Full end-to-end Playwright walkthrough (both free-tier and temporarily-Pro-granted-then-reverted test accounts) confirmed every screen in every tab renders and navigates correctly, with real live data, zero console errors beyond one pre-existing harmless web-only SVG prop warning unrelated to this session's work.
- The **latest code is pushed to GitHub** (`main` is up to date with `origin/main` as of the last check this session).
- **The current standalone APK is stale** — the most recent successful EAS build predates this entire 4-tab restructure by 26+ commits. **A fresh APK has not yet been built as of this handoff.** This is the single most pressing "next step" item — see §8.

---

## 7. The supervisor's 26-item checklist — exact current status (most recent authoritative answer)

This is the literal numbered list the supervisor sent, and the honest answer given back after this session's verification+fix work. Use this as the ground truth for "what does the supervisor think is done" going into the next session — if the supervisor sends a follow-up, this is where the conversation left off.

**Design feedback (1–10): all Done.** White theme, Inter font, centering, logo/wordmark spacing, `®`, button text size, no people images, sunglasses-for-Fashion, basketball-for-Sports, category-icons-only-for-contacts.

**Bottom tab bar (11–15): all Done**, as of the 30–31 October restructure described in §6. Home/Power Moves/Challenges/Search with the exact requested icons, in that order.

**Features:**
- **16 (Directory)**: Done. 5 categories, A-Z, search, filters, favorites, contact detail, tap-to-call/email/web all confirmed live.
- **17 (Tracker)**: Done.
- **18 (Challenges)**: Done. 6 tracks × 10, both named counter examples confirmed working.
- **19 (Power Moves / questions module)**: **Half done.** Module and CSV import both built and working; **no real question content has been loaded** — the client's 125 questions have not been received. This is a content gate, not an engineering gap.
- **20 (Quotes 225, random, no-repeat-32-weeks)**: **Done**, with an honest caveat: rotation/no-repeat mechanism is fully built and verified (224-day exclusion window). Count is 223 of the stated 225 — confirmed by direct inspection of the client's own source file, which only contains 223 quotes. 2 more are needed from the client to hit the literal number; this is not fixable from the engineering side.
- **21 (Subscription)**: Done.
- **22 (Auth)**: **Half done.** Email/password, Google, forgot-password, delete-account all done and real. Apple sign-in remains an intentional placeholder — blocked on the client providing an Apple Developer account (unchanged status since Week 2's original decision).
- **23 (Admin panel)**: **Done**, as of this session's Questions CRUD page addition. Contacts (add/edit/soft-delete), CSV bulk upload, Quotes, Challenges, and now Questions all have full add/edit/deactivate/restore CRUD, consistently soft-delete-only across the board.

**Technical:**
- **24**: Supabase (confirmed zero Firebase remnants anywhere).
- **25 (current APK link)**: **Not done / stale.** Needs a fresh EAS build — the existing one predates the 4-tab restructure. This is the clearest, most concrete next action.
- **26 (does the app work on placeholder data, so only import is left)**: Yes — confirmed. Every feature works against real/placeholder schema right now; the only remaining work for full content-completeness is the client sending the 125 questions and the 2 remaining quotes.

---

## 8. Immediate next steps, in priority order

1. **Build a fresh EAS APK** (and, if an iOS path is available/requested, an iOS build) from current `main` (`7610517` or later) and send the supervisor/client an updated build link. This is the single most overdue, most clearly-actionable item. Check `apps/mobile/eas.json` for the existing build profiles (`development`, `preview`, `production`) before running `eas build`.
2. **Confirm whether the `QA-TEST Contact 582406` stray test record is still live** in the Supabase `contacts` table (flagged as needing cleanup in `docs/phase2-route-qa-matrix.md`, never confirmed removed in any later doc) and remove it if so. Same for the "stray `markhor-proj` Vercel project" mentioned in the same doc, if it's still around and causing confusion.
3. **If/when the client sends the real 125 questions**: import them through the new `apps/admin/src/pages/QuestionsPage.tsx`'s CSV import link (`/questions-import`), which already has full validation (headers, required fields, natural-key duplicate detection) built and tested against the template. This is pure content-loading work, no engineering needed.
4. **If/when the client sends 2+ more quotes** to reach 225: same path, via `/quotes-import`. The conversion script used this session (`docs/EPP-Power-Quotes-import-ready.csv` as the output shape) is a reusable template if the new quotes arrive in a similarly messy raw format.
5. **If/when the client/Bilal obtains an Apple Developer account**: build real Sign in with Apple (currently a clean, honest placeholder — `handleAppleLogin()` in `LoginScreen.tsx` / `SignUpScreen.tsx`) and wire real Apple in-app purchase. This has been "deferred, not dropped" since Week 2's original decision (2026-09-14) — it has never been assigned to a specific week/date, by design, because there's nothing to build against until the account exists.
6. **At actual store-submission time**: swap the RevenueCat Test Store keys in `.env` for the client's real platform public keys (no app code changes needed — `billingIsConfigured()` is key-agnostic by design), then after the client's first real purchase succeeds, run `supabase/cutovers/week3_paid_entitlement.sql` to formally disable the preview/test-purchase path. This is fully documented in the two 2026-10-15 addenda at the bottom of `docs/week3-build-log.md` — read them before doing this step, they explain exactly what to check first.
7. **Consider the genuine Week 4 scope** (full device QA matrix across real Android/iOS hardware, store listing copy/screenshots, privacy policy, actual store submission) — this has not meaningfully started. Nearly every doc in this repo flags that **no physical device or emulator has ever been attached** during any testing session (this machine appears to be a cloud/Linux dev box with no Android/iOS hardware access) — every "device open" row across `phase2-route-qa-matrix.md`, the Week 3 build log, and the supervisor execution log is still open. If a physical device becomes available, that's the single biggest category of unverified-but-probably-fine work remaining.
8. **The cosmetic "Home > Home" nested-screen-name navigation warning** (§6) — low priority, purely a console warning, but a quick fix (rename the inner Home screen to something distinct) would be a clean five-minute task if picking up small polish items.
9. **`README.md` is stale** — still describes Week 1 status. Not urgent, but worth a refresh if someone unfamiliar with the project's history ever needs to onboard from it instead of this handoff file.

---

## 9. A detailed cautionary tale worth reading: the 30 October "is this demo-safe" investigation

This is included in full because the *debugging process* itself contains durable lessons about this specific codebase that aren't written down anywhere else, and because it's a good model for how to actually verify "is this really done" rather than trusting a green test suite.

Bilal asked, reasonably, "are you sure this is actually tested end-to-end, I don't want it to break in front of the client." A first pass of automated Playwright checks against the 4-tab restructure reported passing, but several of those checks turned out to be **false positives** — the test script was reading `document.body.innerText()`, which in this app returns text from *every* mounted tab's stack simultaneously (React Navigation keeps inactive tab stacks mounted, not unmounted, for performance — this is mentioned explicitly in `HANDOFF_UI_REVAMP.md` too, under "things that will bite you," so it's a recurring gotcha in this codebase). The fix was switching assertions to Playwright's `locator(...).locator('visible=true')` pattern, which correctly respects the app's actual (opacity-based, not `display:none`-based) tab-hiding mechanism.

A deeper investigation followed when Directory/Search and Power Moves both appeared to stay "locked" (paywalled) even after an attempt to grant the test account Pro status by setting `profile_entitlements.is_pro = true` directly in the database. The grant appeared to do nothing. Root cause, found by reading the *actual live* `is_pro()` function definition via `pg_get_functiondef` rather than trusting remembered schema: **a later Week 3 migration had rewritten `is_pro()` to check `subscription_status` instead of `profile_entitlements.is_pro`.** The test account genuinely had zero rows in `subscription_status` (never completed a purchase) — so the gating was working *correctly*, not broken; the test setup was using a stale, no-longer-read column. The `profile_entitlements` edit was reverted (set back to `false`, since it was a no-op edit on an unused column anyway), and a correctly-targeted temporary test entitlement was inserted into `subscription_status` instead (with the permission system correctly gating this action pending explicit approval, since it's the real, live billing-state table — not something to mutate casually). With that in place, every previously-"stuck" screen (ContactDetail, premium Challenge tracks, the full Power Moves question flow) was re-verified and confirmed genuinely working, with a real contact's full detail screen (Call/Email buttons, notes, favorite star, "Add to Tracker") rendering correctly. The temporary test entitlement was then cleanly deleted afterward, leaving no trace in the live database.

**The durable lessons, if you hit something similar:**
- If a Pro-gated screen seems stuck locked during testing, check `subscription_status` for the test account, not `profile_entitlements.is_pro`. Query the live `is_pro()` function definition directly (`select pg_get_functiondef(oid) from pg_proc where proname = 'is_pro'`) if ever in doubt about which table actually gates entitlement — don't trust old docs/memory of the schema, it has changed at least once mid-project.
- `document.body.innerText()` is not a reliable way to assert "what screen is currently showing" in this app, because of the always-mounted-tabs behavior. Use Playwright's `visible=true` locator filter, or assert against a specific heading/element known to be unique to the target screen.
- Network/environment flakiness (random browser closes, DNS blips, CLI timeouts) has happened repeatedly on this machine and is very often disk-space or memory pressure, not a real bug in the app or the test — check `df -h /` and `free -h` before spending a long time debugging a test script that "should obviously work."

---

## 10. Where to find things — a quick-reference index

| Need to know... | Read |
|---|---|
| Original product spec (screen behavior, QA checklist) | `docs/Entertainment-Power-Developer-Handbook.md` (mentally substitute Firebase→Supabase, see §2 above) |
| Why/how the backend moved to Supabase | `docs/week1-acceptance.md` |
| Exact Week 2 requirements, quoted verbatim | `docs/week2-implementation-plan.md` |
| Week 3's very detailed execution contract and what "done" actually requires | `docs/week3-implementation-plan.md` |
| What Week 3 actually delivered, phase by phase, with honest caveats | `docs/week3-build-log.md` — **especially the two 2026-10-15 billing-acceptance addenda at the bottom** |
| The supervisor's Oct 3-9 light-theme sprint — full plan | `docs/supervisor-oct-3-9-implementation-plan.md` (819 lines, very thorough) |
| What that sprint actually delivered | `docs/supervisor-oct-3-9-execution-log.md` |
| Current category icon mapping decision | `docs/icon-options.md` |
| Auth deep-link / redirect URL configuration | `docs/mobile-auth-deep-links.md` |
| The abandoned pixel-accurate dark-mockup redesign attempt (historical, do not resurrect without asking) | `docs/HANDOFF_UI_REVAMP.md` |
| What's still owed by the client before full completion | `docs/client-handoff/open-items-client-required.pdf` (built this project, covers Apple/Google developer accounts, RevenueCat real keys, 125 questions, 225 quotes, store listing assets) |
| Original two paid-account setup instructions for the client | `docs/client-handoff/client-setup-checklist.pdf` (narrower/older than the open-items PDF above, covers just Apple/Google account creation steps) |

---

## 11. A note on tone and working style, for whoever picks this up

Bilal is hands-on, direct, and has repeatedly corrected both over-claiming ("this is done" without actually checking) and under-verifying (trusting old docs instead of checking current live state). He explicitly wants thorough, honest status reporting — half-done is a completely acceptable and expected answer, as long as it's accurate and says exactly what's left. He has also explicitly said "you do everything, I ain't doing shit" at points, meaning: don't make him run your verification steps for you when you have the tools to do it yourself (CLI, Playwright, live DB access) — but that same instruction does not override the permission-gated actions around genuinely risky/shared infrastructure changes (restoring a paused prod database, writing to live billing tables) — those still correctly require his explicit sign-off even under a "handle everything" instruction, and he has been fine with that boundary every time it came up.

When he asks a status question in a terse, almost rude-sounding way ("is latest code pushed?", "bruh do it"), that's just his communication style under time pressure — it is not hostility, and the right response is a direct, accurate, no-fluff answer, not a defensive one.
