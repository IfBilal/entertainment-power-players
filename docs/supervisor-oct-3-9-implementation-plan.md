# Entertainment Power Players — supervisor delivery plan, 3–9 October

**Status:** Execution plan, not an implementation or acceptance report. Prepared 3 October 2026 from Bilal's seven-day instruction, the current repository, the two new CSV templates, and the existing Week 1–3 records. The coding agent must update a separate execution log with actual commits, builds, test evidence, approvals, and blockers as work proceeds.

## 0. Read this first: mandate, authority, and scheduling

Bilal's message is the **current visual and delivery brief**. Its white, centered, minimal direction supersedes the dark PNG/JPEG mockups, `docs/design-system.md`, old UI revamp prompt, and any code comments that say the dark gradients are authoritative. Continue to use `docs/Entertainment-Power-Developer-Handbook.md` for product behavior that Bilal did not change. Keep the existing **Supabase + Vercel + Expo/EAS** architecture; the handbook's Firebase terminology is historical, not a request to migrate the live project.

The requested sequence is:

| Supervisor milestone | Required result | Evidence that must exist before marking it done |
|---|---|---|
| “Fri 3” | Splash, directory, contact detail, tracker, challenges redesigned | Five reviewed screen families, screenshots, functioning preview, regression checks, private delivery to Bilal |
| “Sat 4” | Light theme on every remaining app screen; completed category icon set | Full screen inventory and screenshot audit on Android and iOS-sized layouts |
| “Sun 5” | Questions data model and CSV import for 125 questions | Migration/RLS/import tests; exact 125-row content count only when client data arrives |
| “Mon 6” | Questions screens; 225 quotes; per-user daily rotation with no repeat for 32 weeks | Navigation/data tests, 224-day sequence test, actual 225-row count when client data arrives |
| “Tue 7” | Admin add/edit/delete contacts and CSV import against supplied template | Deployed-site CRUD/import checks with clean test data and malformed-file checks |
| “Wed 8” | Monthly/annual subscription paywall, **no free trial**, real device tests | Store product/configuration proof, sandbox purchases and entitlement/RLS evidence where devices/accounts exist |
| “Thu 9” | Bug fixes, fresh standalone APK, iOS build, short demo video | Build IDs/artifacts, smoke-test matrix, private handoff and honest unresolved-gate list |

**Calendar conflict:** On the current system date, 3 October **2026 is Saturday** and 9 October **2026 is Friday**. “Fri 3” through “Thu 9” matches a different calendar year. Preserve Bilal's seven milestone labels and 3–9 date-number order in status reports; confirm the actual deadline date/year with him before promising calendar-day delivery. Do not silently relabel the dates or mark an already elapsed milestone complete. Start the technical sequence immediately and record actual timestamps in Pakistan time.

**Content dependency:** `docs/EPP-Questions-Template.csv` contains a header and **two example questions**, and `docs/EPP-Directory-Template.csv` contains a header and **three example contacts**. Neither is the promised production content. The client will provide the 125 questions and 225 quotes later. Build importers, UI, and synthetic test fixtures now; never represent examples, generated filler, or the few existing quotes as delivered client content. The 125/225 content acceptance gates remain open until the real files arrive and pass validation.

**Working agreement:** Work on `main` and push each verified phase, as previously requested. Stage only scoped changes; preserve the unrelated untracked `.agents/`, `.aider-desk/`, `.claude/`, `data/`, and `skills-lock.json`. Treat the two new CSV templates as user supplied source files; preserve their bytes and only add them to version control if appropriate for their visibility. No agent sends files or messages to anyone other than Bilal without explicit direction. A screenshot or APK for “send to me, not anywhere else” goes through a private channel only; do not put a distribution URL in a public issue, repository document, or social post.

**Gate policy:** Execute the phases in order. After each phase, run its full automated, visual, persistence, and available-device checks, record evidence, fix failures, and rerun the affected checks **before starting the next dependent phase**. If client content or an external Apple/store capability is missing, mark that acceptance item blocked and keep its milestone open; unrelated work may proceed as a clearly separate workstream, but a coding agent must never convert “synthetic fixture passed” into “client content accepted.” The final build requires every open content and platform gate or an explicit incomplete handoff.

## 1. Verified starting state and implications

At plan time, `main` and `origin/main` point to `b56cb4b` (“let the client-facing build use the demo premium unlock”). There are no tracked working-tree edits. The most recent Week 3 stable-ID code is at `745c3d5`; its cutover migration has **not** been applied to EPP. The EPP project is `knrjhmrsuyzzxlverryl`; prior build notes say the five earlier Week 3 migrations and billing Edge Functions are deployed, but RevenueCat secrets/products and the paid-entitlement cutover are not. Reconfirm remote state before any migration or release.

| Area | What exists now | Work required under this brief |
|---|---|---|
| Mobile visual system | Near-black `apps/mobile/src/theme/colors.ts`, dark aurora/glow/gradient components, Inter typography, existing animations | Replace with white/light tokens; remove dark-only effects and any human imagery; rebalance layout and contrast |
| Admin visual system | `apps/admin/src/index.css` also uses dark surfaces | Apply compatible light brand treatment to admin without impairing dense data entry |
| Category icons | Fashion is `glasses-outline`; Sports defaults to trophy or football in some maps | Use a recognizably **sunglasses** glyph for Fashion and **basketball** for Sports everywhere, including server-driven icons, fallbacks, and admin picker |
| Brand mark | Splash separates logo mark and wordmark; multiple text lockups omit `®` | Bring logo visually closer to wordmark; add one correctly positioned `®` after visible “ENTERTAINMENT POWER PLAYERS” lockups |
| Five priority screen families | Splash, category/list directory, contact detail, tracker, challenges already have functional screens | Redesign them first and keep navigation/data flows working |
| Other screens | Auth, onboarding, home, inspiration, profile, paywall, editors, overlays, share card | Move all to the same light system on the next milestone |
| Contacts admin | Add/edit and soft deactivate/restore exist; import UI and Papa Parse based validation exist | Test and repair exact provided CSV mapping, errors, duplicate behavior, and deployed mobile reflection; label “Delete” semantics clearly |
| Questions | No questions schema, service, admin importer, or mobile screen found | Build full content pipeline and question experience |
| Quotes | Live feed/save/share exists; `quoteOfTheDay()` hashes the date and can repeat | Add per-user persistent 224-day exclusion and import/validation path for 225 client quotes |
| Apple sign-in | A visible Apple button routes to signup or shows “isn’t set up yet”; no native Apple auth implementation | Implement/configure if required for final acceptance; arrange external iPhone verification |
| Purchases | RevenueCat client/webhook code exists, but preview APK uses test entitlement without store products | Configure actual two-plan store billing, no trial; test both platforms; complete server paid cutover only after evidence |

The current EAS Android preview build is **ID `0df58ec8-ff5c-4ee7-9475-ab93be31addf`**, finished on 3 October 2026 at commit `b56cb4b`, app version `1.0.2`, version code `6`, and is an internally distributed **APK**, not a development client. Retrieve its artifact from the authenticated EAS build page. Its `preview` environment has `EXPO_PUBLIC_ENABLE_TEST_PURCHASES=true`, the EPP Supabase URL, and no RevenueCat public key; it offers a **demo premium unlock** rather than a real purchase. Perform an install/login/critical-flow smoke check before representing it as usable. Do not present this artifact as the final redesign or as evidence of working purchases.

### Today's private reply to Bilal

Prepare a concise reply containing three facts, after verifying the APK install:

1. The current Android APK build ID/version and a **private** downloadable artifact link. Label it “current preview build / demo premium,” not “final week build.” Send the five redesigned screens separately when Phase 1 passes.
2. Backend is **Supabase**, not Firebase. The admin site is on Vercel. State this plainly; do not imply that Firebase and Supabase are both in use.
3. Without a local Apple device, EAS can create the signed iOS build and Xcode/iOS simulator checks are possible only on an available macOS runner. Native Sign in with Apple and genuine Apple sandbox purchase acceptance still require a remote physical-iPhone tester or client with TestFlight. Supply that tester with a small script, capture a screen recording and sanitized result/logs, and review the Supabase and RevenueCat records remotely. A simulator, SDK mock, or Android device does not prove those iOS flows.

## 2. Global design contract: exact visual target

### 2.1 Source-of-truth rules

- Use a **white background/light theme** on every app and admin surface: root, stack screens, cards, sheets, dialogs, status/navigation bars, skeletons, error states, screenshots, share image, and icon masks. Avoid dark full-screen backgrounds and old aurora streaks.
- Use one clean contemporary sans serif consistently. The installed Inter family is a valid starting point for mobile; choose matching sans treatment for admin. Remove “editorial,” serif, pseudo-serif, faux-bold, and old dark-mockup comments that describe obsolete intent.
- Compose every screen around a centered, balanced axis: brand, page title, primary CTA, primary illustration/icon, and empty state should align intentionally. Lists and long body text may align within a centered content column for readability; the column itself remains symmetrical with equal outer margins. Check right-to-left mirroring separately where applicable.
- Place the logo **lower** in the splash/intro composition and bring its mark **closer to the wordmark**. Validate against actual 360–430 dp phone heights, safe areas, and keyboard states rather than choosing one fixed pixel offset.
- Render `ENTERTAINMENT POWER PLAYERS®` in every visible brand text lockup: splash, onboarding/auth where brand appears, profile/about, paywall, admin brand header/login, quote-share art, intro/outro cards, and video overlay. Check artwork: if a bitmap already includes `®`, do not overlay a second one. This is a UI-visible brand rule; do not rename DB identifiers, package IDs, domains, auth redirect schemes, or legal account names.
- Increase **button label** size and hierarchy globally. Start with at least an 18 sp/px primary button label and 48 dp mobile tap height; use sensible accessible desktop targets. Verify the actual appearance at default and large text settings. A larger pill without larger text fails this requirement.
- Use **no images of people**: remove the concert crowd onboarding asset, human photos, portrait placeholders, human silhouettes used decoratively, and human photos in previews/share cards. Existing saved user photo URLs should not render in this brief; use initials/abstract shapes. Review bundled assets and runtime `Image` uses, not just the five priority screens.
- Use category pictograms as the only content/decorative icon illustrations. Functional controls (back, search, close, navigation, save, call) may use clear utility glyphs, but no decorative stock art. Fashion gets recognizable **sunglasses**; Sports gets a **basketball**. Keep Film/TV, Gaming, and Music icons coherent and consistently mapped.
- The feeling is **vibrant, minimal, contemporary**: white space, confident brand accents sampled from the existing mark, simple cards/dividers, crisp type, restrained motion. Avoid retro browns, dark neon glows, photorealism, busy gradients, and ornamental texture.

### 2.2 Concrete token and component work

1. Define semantic light tokens in `apps/mobile/src/theme/`: page/surface/raised backgrounds, primary/secondary/disabled text, borders, brand accent, interactive focus, success/warning/error, overlays, charts, and transparent states. Propose exact values in a one-page visual specification and capture contrast measurements; do not leave hardcoded dark values in feature screens.
2. Create equivalents as CSS custom properties in `apps/admin/src/index.css`. Ensure the admin can still show large tables, inline validation, disabled buttons, and modals without low-contrast grey-on-white text.
3. Refactor shared components first: `Screen`, `Aurora` or its replacement, `AppText`, `Button`, `Logo`, `Card`, `CategoryCard`, `QuoteCard`, `BottomSheet`, `FormField`, `SectionHeader`, progress controls, and `MainTabNavigator`. Status bar icon color, keyboard avoidance, focus/pressed/disabled states, and safe-area backgrounds must match.
4. Audit every `LinearGradient`, `ImageBackground`, `Image`, `require(...)`, overlay opacity, `colors.backgroundDeep`, and literal dark hex. Remove or retune old dark effects. Keep an intentional small brand accent only where useful (button, progress, selected tab); white remains the dominant visible surface.
5. Define a single category icon resolver taking the database category slug/icon plus a local canonical fallback; use it across Directory, Track Picker, Challenges, admin preview, and empty states. Existing database icon choices must not override the mandated sunglasses/basketball pair. Avoid separate conflicting `trackIcons` defaults.
6. Design motion into the new system without obstructing tasks: a short splash reveal, press feedback, card entrance/stagger on first load, progress updates, sheet movement, and tab transitions. Respect reduced-motion settings, avoid perpetual animation, preserve testability, and stay responsive on midrange Android devices.
7. Build at least two visual checkpoints: a compact Android layout (about 360 dp wide) and a taller 390–430 dp layout; include iPhone safe-area/simulator dimensions when available. Check light and system-dark device settings: this brief uses the light appearance in either setting unless a later approved design says otherwise.

### 2.3 Visual acceptance rubric

For every screenshot, review: white canvas; centered composition; balanced margins; logo/wordmark spacing; single `®`; no human imagery; correct category icon; larger button text; readable contrast; no clipped text; stable bottom tabs; clear action hierarchy; vibrant but uncluttered. Record pass/fail and a screenshot file for each screen. Bilal's review of the first five screens is a required visual sign-off, not a substitute for functional tests.

## 3. Phase 0 — baseline, asset inventory, and private current-build handoff

**Inputs:** current `main`, EAS build `0df58ec8-ff5c-4ee7-9475-ab93be31addf`, two CSV templates, Week 3 build log, supervisor message.

**Implementation and inspection tasks**

1. Capture repository SHA, status, upstream, current admin deployment, EPP Supabase ref and migration list, app/EAS profiles, current installed-package version if an Android test device is attached, and available iOS signing/tester access. Read current EAS/Expo and Supabase CLI help instead of using remembered flags.
2. Download the *existing* preview APK to a controlled local artifact directory, calculate SHA-256, inspect package name/version/signature/launchability, and install/smoke on an Android phone or emulator. Record which Supabase environment it points to and that the premium button is a demo unlock. Keep the artifact outside source control.
3. Run baseline mobile typecheck/tests and admin typecheck/tests/build. Execute targeted current auth, directory, tracker, challenge, inspiration and paywall flows against disposable test accounts. Record failures as baseline issues; do not attribute them to the redesign.
4. Inventory all screens/routes/components, current photos, brand strings, hardcoded backgrounds, category icon values, APK/iOS identifiers, and visual dependencies. Record the old concert asset and any profile/avatar image usage explicitly.
5. Inspect `docs/EPP-Directory-Template.csv` and `docs/EPP-Questions-Template.csv` with a real CSV parser. Record headers, encoding, sample rows, missing columns, duplicates, and client content still outstanding. Keep sample data out of production.
6. Draft one visual direction sheet and five low-fidelity composition frames from Bilal's rules. Ask for only decisions that genuinely change the result (for example, exact approved logo asset, membership gating for questions, access to an iPhone tester); continue all independent work.
7. Send Bilal the requested **private** current-build/backend/iOS-testing response after smoke. Do not promise Apple purchase validation until a real iOS tester and configured Apple products exist.

**Tests and evidence:** baseline test logs; EAS build metadata and local APK checksum; install/login smoke result; CSV parser report; screen/asset inventory; privately delivered reply record.

**Acceptance gate:** Current APK state is honestly reported, Supabase is confirmed, iOS validation path is explicit, no content template is mistaken for actual content, and baseline failures are documented. Do not start changing the five screens until the old-state screenshots and route list exist.

## 4. Phase 1 — five priority screen families (“3” milestone)

**Shared design first:** land light tokens, shared typography/button/logo changes, icon resolver, and a temporary visual regression gallery. Every page below must use real data adapters and existing navigation, not a static facsimile. Capture before/after screenshots and a short recording of the five-screen journey.

### 4.1 Splash

- White full-bleed surface; lower centered logo composition; mark tightly coupled with `ENTERTAINMENT POWER PLAYERS®`; small intentional accent without dark aurora.
- Preserve the existing auth-hydration timing fix and routing to intro, track picker, or main app. Avoid animation that traps fast auth sessions or blocks loading/error display.
- Check app icon and splash branding relationship at native startup; logo must not stretch, crop, or duplicate the registered mark.
- Test signed-out, new signed-in, returning signed-in, fast-network, slow-network, and offline-start paths.

### 4.2 Directory

- Redesign category grid and category contact list as one family. Center title/search controls in a balanced container; show five category icons and counts; no portraits.
- Sunglasses for Fashion and basketball for Sports in every category card, filtered list header, admin-provided icon fallback, and accessibility label.
- Preserve search, role/city/favorites filters, A–Z jump-to-letter, free-user gating, empty/error/loading states, and back navigation. Check long/diacritic names and list virtualization.
- Test category tap → search/filter → A–Z jump → contact selection, then return with scroll/filter state intact.

### 4.3 Contact detail

- Center header/category icon and information hierarchy; use text and category pictogram only. Render name, role, company, city and available contact methods with clear labels and no empty controls.
- Preserve call/email/website deep links, favorite toggle, add-to-tracker state after navigation/reopen, and premium access behavior. The city must appear when present in persisted contact data.
- Test one complete contact, one with missing phone/email/site, URL schemes, free vs premium access, and restored favorite/tracker state.

### 4.4 Tracker

- Rework dashboard to a bright, symmetric focal ring/metric layout, readable 1/5-style centered count, three goal bars, eight-week chart and clear CTA labels. Larger CTA text and high-contrast data labels are mandatory.
- Preserve contact/event/follow-up logging, goal edits, exact history rows, week rollover, swipe delete, and challenge completion write-through. Focus ring/count centering must be measured at multiple screen widths.
- Test add/reopen/delete for all three log types, zero goals, week history, custom event date, and a logged activity appearing in the correct week.

### 4.5 Challenges

- Rework track list and track detail as the fifth family. Use canonical category icons, centered progress summaries, large clear actions and spacious cards. Challenge detail remains coherent when opened from a track.
- Preserve first-signup selected tracks, single/counter progress, notes, stable challenge IDs, tracker activity link, and live admin edits. Do not turn on challenge reordering until the coordinated database/app cutover is verified.
- Test single toggle and counter target/reopen with a real server account, reload, title edit while detail stays open, deactivation, and free-user gating.

**Visual review package:** five named image files or a single review PDF, each with a compact/tall viewport; note where interactions require a recording. Send the package **only to Bilal**. Record his specific corrections rather than replacing them with mockup-based judgments.

**Phase gate:** Every design rule passes for all five families, existing functional tests pass, device smoke finds no blocked control or lost data, and Bilal has received the review package. Any correction he sends becomes a tracked acceptance item before Phase 2 closes.

## 5. Phase 2 — remaining light-theme screens and complete icon system (“4” milestone)

### 5.1 Route-by-route screen inventory

| Area | Screens/states to migrate | Functional regression check |
|---|---|---|
| Onboarding/auth | Intro slides, login, signup, forgot password, reset password, deep-link completion, track picker | Email/Google auth, email confirmation/reset returning to app, Apple placeholder handled honestly until built |
| Home/navigation | Home, all five bottom tabs, headers, drawers/sheets | Correct tab icons, safe-area/keyboard behavior, premium/free routing |
| Directory follow-ons | Filter modal, paywall redirect, favorites state, contact action feedback | Search/filter/favorite state survives navigation and app restart |
| Tracker follow-ons | Log selector, log forms, goals editor, history detail/delete confirmation | Save errors visible; week key and counts persist |
| Challenges follow-ons | Challenge detail, note editor, track selection in Profile | Stable-ID progress and all buttons work |
| Inspiration | Quotes feed, Saved, image-share preview, empty/error states | Every quote can save/share; share image uses light brand system and `®` |
| Subscription | Paywall, restore status, Profile subscription state | Both plan cards readable; no free-trial claims; preview clearly labeled |
| Profile/settings | Profile home, edit name/email, notification preferences, security/reset, logout/account actions | Saved values persist; current user name shown; no profile portrait image |
| Admin website | Login, home, categories, contacts, import, quotes, tracks, track challenges, modals | CRUD readability, keyboard focus, responsive tables, no dark leftover surfaces |

### 5.2 Icon and brand audit

- Make a single five-category specification: Fashion sunglasses, Film/TV film/camera, Gaming controller, Music musical note, Sports basketball. Prefer existing vector icon code; draw/adapt a custom vector sunglasses only if the installed icon pack lacks a recognizable shape. Confirm licensing for any new icon asset.
- Apply matching glyphs to Supabase category `icon` values through an audited migration or mapping, and to local fallback. Reconcile category-slug spelling (`film-tv` versus display “Film/TV”) without changing stable slugs.
- Replace any people imagery and any obsolete sports trophy/football or Fashion generic eyeglass icons. Audit asset files and UI render paths, including onboarding photograph, quote share/export, admin previews, profile avatars and placeholder/empty states.
- Search all visible brand text and image lockups for `ENTERTAINMENT POWER PLAYERS`; ensure a single following `®`, correctly sized/aligned. The app name “Power Players” may remain a compact OS label if space requires, but visible full brand references must include the mark.

### 5.3 Visual and interaction QA

- Create a route screenshot matrix showing the normal, loading, empty, error, selected, disabled, and premium-locked states that exist for each screen.
- Compare compact Android, larger Android, and iPhone safe-area dimensions. Check large font scaling, keyboard open, landscape handling where supported, status/navigation bar contrast, and reduced motion.
- Test tap target size, label legibility, focus outline, readable forms, validation, push/back stack, deep links and content refresh. Run mobile typecheck/full tests and admin typecheck/tests/build after shared component migration.

**Phase gate:** No reachable screen uses the old dark palette or people imagery; all required icon/`®` placements are accounted for; all routes and core actions survive a clean install and logged-in session; screenshot matrix is reviewed. The admin site may deploy after its data/API compatibility is proven, with deployment URL and build ID recorded.

## 6. Phase 3 — questions model and 125-row CSV ingestion (“5” milestone)

**Contract from the supplied template:** `category,challenge_group,number,question,answer,why,power_move`. Preserve exact source text and punctuation. `category` resolves to existing category slug; `challenge_group` is a titled grouping, `number` is a positive order within a group, and `question`, `answer`, `why`, `power_move` are long-form fields. The final file may reveal constraints not visible in the two sample rows; validate before locking them in.

### 6.1 Database and access model

1. Add an imperative Supabase migration for `questions` with stable server-generated ID, category FK, group label/key and ordering, number, content fields, active flag, timestamps, and source/import metadata where useful. Use a uniqueness rule for the verified natural key (likely category + group + number); check full client content for repeated numbering before enforcing it. Avoid using row position as identity.
2. If the experience records progress, add owner-scoped `question_progress` keyed by `(user_id, question_id)` for answered/revealed/completed timestamps only. Do not invent quiz scoring, streaks, or timed responses without a requirement. Preserve progress when a question is edited or deactivated.
3. Add indexes for category/group/order reads and the `question_progress` user/FK paths. Apply explicit least-privilege grants and RLS to every exposed table: signed-in members can read active questions under the chosen entitlement rule; admins can manage content; one member cannot see another's progress. Use a server-side premium gate if questions are treated as challenge content.
4. **Product assumption to confirm before publishing:** locate Questions under Challenges and gate it with existing `is_pro()`, because it is challenge-grouped educational content. If Bilal specifies a free question experience, change the RLS and navigation rule together before release; do not rely on UI hiding alone.
5. Test migration/backfill on local or isolated staging, run Supabase advisors, inspect policy behavior as anon/free/pro/admin, and verify the correct EPP project/history before applying remotely. Existing remote migration-number mismatch forbids a blind `supabase db push`.

### 6.2 Import pipeline

1. Build an admin-only Questions CSV route or explicit import mode using the template headers exactly. Parse UTF-8 with BOM, quoted commas/newlines, CRLF, trailing blanks and duplicate headers correctly. Report parser errors; never silently skip a malformed row.
2. Show column mapping, file name, row count, category/group distribution, first ten rows, duplicate report, and a pre-import validation summary. Reject missing required columns, blank required fields, unknown categories, non-integer/nonpositive numbers, implausible lengths, duplicate composite keys, and conflicting existing records.
3. Use a deliberate import mode: **create missing / update matched / skip unchanged** with stable question identity and a dry-run diff. For existing content, preserve user progress. An exact re-upload must be idempotent. A partial failure must report imported/updated/skipped rows; do not leave an invisible half-import.
4. Make the 125 count a pre-publish gate: 125 distinct, active, validated client questions with category/group totals in a signed-off import report. The two example rows support parser/UI tests only; synthetic 125-row fixtures support load/ordering tests only.
5. Keep service keys out of the admin browser. Enforce admin authorization in RLS or a tightly scoped server import endpoint/RPC and test a forged non-admin upload. Size/chunk requests to stay within API limits without long database transactions.

**Tests:** parser/unit cases, malformed-row report, duplicate/idempotent upload, 125 synthetic rows, row-order independence, entitlement/RLS SQL tests, admin UI upload/preview/retry, app query against seeded staging data, and database row-count reconciliation.

**Phase gate:** Schema and importer pass local/staging tests and an admin can import/re-import a synthetic 125-row file without corruption. The **content** gate is separate and stays open until the client sends an actual 125-row file that passes all checks. Do not call the milestone complete with the two-row template.

## 7. Phase 4 — questions screens and per-user 225-quote rotation (“6” milestone)

### 7.1 Questions experience

- Add a Questions entry inside Challenges (subject to the access decision), then a category list, group list, question list/card, and detail/reveal flow. Put the question first; reveal `answer`, then `why`, then `power_move` in a clean, centered, scrollable layout. Maintain category/group/number order from data and stable deep-link IDs.
- Provide obvious next/previous within the group, progress position (“n of m”), loading/empty/retry/deactivated states, and a safe return to the same group/list scroll position. Long answers and power moves must wrap and remain readable at large font sizes.
- If progress is approved, save viewed/revealed/completed state per user; test account switch and reinstall. If not approved, keep a read-only learning journey and do not display false completion metrics.
- Use shared white theme, category icons, larger button labels, `®` on any full brand lockup, and no human images.
- Test all five category paths when content exists; until then seed disposable staging fixtures for each category rather than fabricating production questions.

### 7.2 Quote content intake

- Create or extend an admin-controlled quote CSV path once the client supplies the 225 quotes. Define a documented import template with stable ID or content fingerprint, `text`, `author`, optional order/category, active status, and source provenance. Do not paste copyrighted or invented quotes into source code.
- Validate exactly **225 distinct active quotes** for launch, reject blank/duplicate text or author, normalize whitespace without changing punctuation, and show a review report. Existing roughly five live quotes from the 30 September preflight are not proof of the final count; re-query current EPP before migration.
- Preserve stable quote IDs so `quote_favorites` and share links remain attached after edits. Admin deactivation must retain saved-history references and not silently reassign a user's daily quote during the same day.

### 7.3 Exact 32-week rotation rule

- Define “no repeat for 32 weeks per user” as: the **featured daily quote** for a signed-in member cannot have been featured for that same member on any of the preceding **224 local calendar days**. The Explore feed may still show and let users save other quotes; it does not constitute the daily rotation. Confirm this interpretation with Bilal if he means all feed exposure.
- Persist daily assignments in Supabase, not local storage or the current date hash. Suggested table: `daily_quote_assignments(user_id, local_date, quote_id, timezone, assigned_at, text_snapshot, author_snapshot)` with PK `(user_id, local_date)`, owner-read RLS and server-only creation. Use the profile's stored IANA timezone and server time; do not trust a caller-supplied date or entitlement boolean.
- Allocation runs atomically under a per-user transaction lock. First return an existing assignment for that local date. Otherwise choose from currently active quotes excluding that user's quotes assigned during the preceding 224 local dates, using a deterministic per-user tie-breaker to avoid everyone seeing the same sequence. Insert once and return the persisted row. Concurrent phone requests must return the same ID. A refresh or reinstall must never change today's assignment.
- A set of 225 distinct active quotes permits a 224-day exclusion window, leaving at least one candidate if all stay active. If fewer than 225 remain after deactivation, **fail with a visible content/configuration alert** rather than silently repeating inside the window. Explain the operational minimum in the admin panel before allowing bulk deactivation.
- On user timezone changes or travel, store and honor the already assigned `local_date` and timezone. Define one stable day boundary rule and test UTC-midnight crossings, DST, backward clock changes, offline reopening, and two devices. Keep assignments and snapshots on quote edit/deactivation; new users get their own rotation ledger.
- Replace `quoteOfTheDay()` selection in the app with the server assignment. Keep saved quotes, all feed-card save/share buttons, and the branded light image share. Owner isolation for assignment history must be tested directly at database level.

**Tests:** 225-quote synthetic fixture; 224 consecutive local days per user with no duplicate; day 225 behavior; two independent users; same-day repeated/concurrent requests; midnight/DST/timezone switch; inactive quote and insufficient-pool behavior; account switch; network failure/retry; save/share and no-people visual audit.

**Phase gate:** Question route/reveal flow and quote allocation pass app, SQL and device smoke tests. The production content gate stays open until actual 125 questions and 225 quotes arrive, are validated, and render correctly in a deployed build. Do not report the numeric target complete from synthetic fixtures.

## 8. Phase 5 — admin contacts CRUD and exact directory-template import (“7” milestone)

**Template contract:** `name,category,role,company,email,phone,website,city,notes`. The three rows in `docs/EPP-Directory-Template.csv` are examples. Confirm the admin parser maps `Film/TV` to existing `film-tv`, retains punctuation and international names, and accepts optional empty email/phone/website/city/notes.

### 8.1 Add, edit, delete

- Exercise every admin contact form field, required validation, category selection, server save, sort keys, active toggle, and explicit error messages. Check a new contact appears in the paid directory without app restart (within the documented refresh window).
- Bilal says “delete.” The current app intentionally **soft deactivates** contacts so favorites, tracker links, and prior history remain valid. Present an action labeled “Delete” only if its confirmation clearly says it removes the record from the directory and can be restored; otherwise label “Deactivate” and explain the behavior in the admin guide. Do not hard-delete referenced contacts as a casual UI action.
- Verify admin-only mutation, unauthorized access denial, duplicate-name handling, optional methods, URL/email/phone validation, and edit while a user is viewing the detail page.

### 8.2 CSV import and recovery

- Use the provided template in a **staging/disposable environment** for acceptance: exact headers, three sample rows, three valid previews, three imported contacts, correct categories and optional-null fields, then re-import behavior. Keep those fictional sample contacts out of the client production directory.
- Audit `apps/admin/src/lib/csvImport.ts` and `ImportPage.tsx`: Papa Parse error propagation, duplicate/unknown headers, mapping of every expected field, quoted newline handling, category validation, URL/email/phone validation, malformed row numbers, chunk retry, partial import reporting, and idempotency. Do not equate “500-row batches exist” with a tested import.
- Choose and display a duplicate policy before import. Because this CSV lacks a stable external ID, do not silently overwrite a same-name contact; flag probable duplicates using normalized name + category + additional fields, then let an admin skip or deliberately resolve them. Retry after partial failure must not create duplicate records.
- Test a mixed file with valid and invalid rows, Unicode names, empty optional fields, a 2,000-row synthetic file, duplicate file, network interruption between batches, and refresh after success. Reconcile UI counts with database counts and sample rows.
- Deploy the verified admin site to the existing Vercel project only after matching Supabase schema/RLS are live. Record URL, deployment ID, commit and smoke results; check at least one real EPP admin login.

**Phase gate:** Admin add/edit/delete semantics and import pass on deployed site and staging data; a changed contact appears correctly in the mobile app; malformed and repeated CSVs yield understandable, accurate reports. The original template remains unchanged.

## 9. Phase 6 — two paid plans, no free trial, Apple auth and real-device tests (“8” milestone)

### 9.1 Product and paywall

1. Configure one `pro` entitlement with **monthly and annual** products/packages in both platform stores and RevenueCat. Obtain approved product IDs, actual prices/territories, tax display and Apple/Google account access from the account owner. Show store-provided localized pricing; do not hardcode amounts or savings.
2. **No free trial**: do not configure trial offers in the stores, remove trial/intro offer marketing from paywall and Profile copy, and ensure RevenueCat metadata cannot cause a trial badge to reappear. Existing historical subscription state may still contain a `trial` enum; handle it truthfully without advertising a new trial.
3. Maintain separate EAS environments/builds: a privately shared **demo preview** APK with `EXPO_PUBLIC_ENABLE_TEST_PURCHASES=true` and no RevenueCat key, and **billing test/store** builds with platform public keys and the demo flag off. The preview's “Activate Premium (test)” must never be used as evidence for purchase acceptance.
4. Verify monthly selection, annual selection, price/period, restore, purchase cancel/error, delayed webhook, subscription state display, expiry/cancelled access, and contact/challenge RLS. The app waits for server-confirmed entitlement; it must not grant access from local SDK `CustomerInfo` alone.
5. Configure Supabase Edge Function secrets and authenticated RevenueCat webhook/reconciliation for the EPP project. Test request authentication, signature/replay rejection, identity mapping, sandbox environment, webhook retry, expired access, and server RLS. Only after successful store-backed tests, run the reviewed `supabase/cutovers/week3_paid_entitlement.sql` to disable preview entitlements in the paid environment. Keep an explicit forward recovery plan.
6. Coordinate the pending `20261001040923_week3_challenge_stable_id_cutover.sql` with the ID-based app rollout. Old direct progress writes stop after this migration; do not deploy the cutover ahead of a compatible app distribution or enable challenge reorder while old builds are relied upon.

### 9.2 Sign in with Apple

- Existing Apple buttons are placeholders, so add native Sign in with Apple implementation and Apple Developer entitlement/capability; connect it to Supabase Auth with stable identity and one-time name/email behavior. Ensure returning users, cancelled authorization, hidden relay email, account switching, and logout are handled. Hide or truthfully disable the button in a build where configuration is unavailable.
- Build a signed iOS/TestFlight candidate through EAS using the correct bundle identifier and Apple team. Check callback/associated configuration, native button availability, account creation, profile name fallback, and Supabase session on the remote iPhone.
- A local Linux/Android setup cannot perform the physical iOS acceptance. Ask Bilal/client to nominate a trusted iPhone tester with TestFlight and an Apple sandbox account. Provide a precise 10-minute script and request screen recording, device/iOS version, build ID, timestamps, and sanitized Supabase/RevenueCat identifiers. Review records remotely; no passwords or receipts in chat/repo.

### 9.3 Platform purchase matrix

| Flow | Android evidence | iOS evidence |
|---|---|---|
| Offerings | Monthly + annual from Google Play test track, no trial | Monthly + annual from App Store sandbox/TestFlight, no trial |
| Fresh account | Signup → paywall → monthly purchase → gated contacts/challenges | Signup/Apple sign-in → paywall → monthly purchase → gated contacts/challenges |
| Annual | Separate tester/account annual purchase | Separate tester/account annual purchase |
| Restore | Reinstall or second device, restore correct Supabase UUID | TestFlight/iPhone restore, correct Apple/Supabase identity |
| Negative cases | Cancel, failed purchase, free user denied, wrong account | Cancel, failed purchase, free user denied, wrong account |
| Lifecycle | Cancel stays active to paid-through; expiration/refund removes access | Same, with matching webhook/server/RLS evidence |

Use Google Play license testing/test track and an iOS physical tester. RevenueCat's Test Store can exercise logic early but is not a substitute for either platform sandbox. A standalone sideloaded preview APK is for UI/general testing; validate Google Play billing with the store-recognized test build/account.

**Phase gate:** Both plans and no-trial presentation verified; authenticated server purchase path proven on available real devices; Apple auth and iOS purchase labeled **untested** until the remote physical-iPhone evidence arrives. Do not declare Week 3 billing complete from mocks, Test Store, simulator or demo unlock.

## 10. Phase 7 — final regression, APK, iOS build, demo, and handoff (“9” milestone)

1. Triage Bilal/client feedback; fix P0/P1 crash, blocked action, wrong entitlement, lost data, missing icon, dark surface or incorrect `®` first. Repeat the affected phase gate after every fix. Maintain a dated bug log with reproduction, root cause, commit and verification.
2. Rerun the full mobile and admin typecheck/test/build suites, SQL/RLS checks, and route screenshot matrix. On a fresh account, exercise signup/login, track picker, directory free/pro gate, contact actions/favorites, tracker logs/goals/history, challenges and questions, daily quote/save/share, paywall and Profile.
3. Run a migration/deployment preflight: backup/rollback strategy, verify EPP ref and migration history, test the stable-ID cutover compatibility, confirm content counts, confirm paid cutover state, inspect Supabase advisors, and check the deployed Vercel admin against the same database.
4. Produce a **fresh standalone Android APK** with a clear profile label (demo preview versus real billing test), new version code, commit SHA, checksum, install verification and EAS artifact/build ID. Confirm no Expo Go, Metro connection or remote update download is needed to launch. If Google Play billing is claimed, attach separate Play test-track build evidence.
5. Produce a signed **iOS build** with correct bundle ID and Apple team, submit via TestFlight for the nominated physical tester if credentials/agreements permit. A generated IPA alone proves compilation, not Apple sign-in or purchase functionality. Record the TestFlight processing and test result separately.
6. Record a short demo video with no real personal data: light splash/brand, five categories/icons, contact action, tracker logging, challenges/questions, featured quote/save/share, monthly/annual paywall, admin contact edit/import. Use a test account and production-like content only where licensed; avoid displaying fake 125/225 counts.
7. Send Bilal the APK, iOS build/TestFlight invitation, demo and a one-page status with **Passed / Failed / Untested / Blocked** rows. Send privately; do not distribute directly to end clients unless Bilal requests it.

**Final acceptance gate:** Bilal's visual rules pass on every reachable screen and admin page; all seven milestone deliverables are checked with artifacts; 125 real questions and 225 real quotes are validated in EPP; 32-week rotation test passes; monthly/annual no-trial sandbox flows and Apple sign-in have physical-device evidence; fresh Android and iOS builds install; no P0/P1 remains. If client content, Apple account, physical tester, or store product approval is missing, explicitly mark the corresponding row **Blocked/Untested** and do not claim the Thursday build “fully complete.”

## 11. Full test matrix and evidence rules

### 11.1 Automation after each phase

- Mobile: `npm run typecheck`, targeted feature tests, then full Jest suite when shared UI/navigation/data code changes. Add tests for meaningful behaviors, not snapshots that merely mirror a component tree.
- Admin: `npm run typecheck`, `npm test`, `npm run build`; validate deployment behavior separately from local compilation.
- Database: rollback-only migration/fixture tests; RLS checks as anon, free member, pro member, and admin; advisor checks after schema changes. Query both counts and representative rows in the intended EPP project only after deployment.
- Visual: screenshot diffs reviewed by a human for every screen/state at compact and tall sizes. Automated color checks should flag near-black root backgrounds, hidden labels, missing `®`, wrong category icons, and any still-referenced people assets.
- Build: exact SHA/build ID/environment recorded; clean install launch, offline launch after prior login, and reopen after force stop. An APK's successful EAS compilation is not an install test.

### 11.2 Essential manual scenarios

| Scenario | Expected outcome |
|---|---|
| Fresh signup with email/Google; Apple on iPhone | Session and correct user profile; no other user's name/data; callback opens app |
| White theme on system dark mode | App stays light; text, keyboard and system bars readable |
| Contact without optional fields | Missing call/email/site controls are absent or disabled truthfully; city renders when present |
| Search/A–Z/favorites | Jumps to actual section, filters accurately, remembers state after navigation |
| Tracker week boundary | Local date and ISO week preserved; zero-goal/week states correct |
| Challenge type/target edit | Progress reconciles by stable ID; exactly one linked history entry or none, as appropriate |
| Question import and navigation | Exact rows/order/text; no duplicate progress or stale answer after edit |
| Quote 224-day window | No member repeats a featured quote in the previous 224 local dates; second member isolated |
| Contact CSV re-import | No silent duplicates; malformed rows reported precisely; existing linked data retained |
| Paywall and expiry | Only server entitlement opens gated data; no free trial; expiry closes data access |
| Apple sign-in/purchase | Remote iPhone/TestFlight recording plus matching Supabase/RevenueCat evidence |

### 11.3 Artifact and reporting format

For each phase log: start/end timestamp (PKT), starting/ending commit, files/migrations changed, environment/project ref, screenshot/video names, test commands/results, device/build identifiers, content row counts, supervisor review result, outstanding risks, and exact reason for any failed gate. Capture only sanitized user IDs/transaction IDs. A test is **passed** only with observed result and evidence; “code exists,” “build succeeded,” and “mock test passed” are separate statuses.

## 12. Critical path, dependencies, and fallback decisions

1. **UI direction** is no longer ambiguous: Bilal's text replaces the dark images. The first five-screen review is the fastest way to catch wrong interpretation. The writing-for-agents structure of this plan deliberately uses observable completion criteria after each phase.
2. **Date labels conflict** with the actual 2026 calendar. Work in sequence now; get an explicit delivery date before a public or contractual promise.
3. **Client content controls completeness.** Importers/screens and synthetic 125/225 tests can finish independently, but real-count acceptance cannot. Request the actual question and quote files early and track their arrival/version/approval. Do not fabricate to satisfy a counter.
4. **Membership rule for Questions** is not specified. Implement the proposed Challenges/premium placement behind a reversible rule, then obtain Bilal's decision before publication. Keep data access policy and UI aligned.
5. **Apple device access controls Apple acceptance.** EAS builds can be made remotely, and remote logs can be inspected; a named physical-iPhone tester is still required to prove native Apple auth and store sandbox flows. Provide a repeatable tester script and review evidence promptly.
6. **Billing is an external configuration dependency.** Product IDs, no-trial offers, store agreements, testers, RevenueCat secrets and platform keys are prerequisites. If unavailable, retain a clearly labeled demo build and mark real billing blocked; never call demo premium a purchase.
7. **Stable-ID database cutover is a release dependency.** Verify migration order, old-build compatibility, and server state before distributing the redesigned APK as final. Keep challenge reorder disabled until the compatible app rollout is verified.
8. **Admin deletion is intentionally recoverable.** Contact records may be referenced by favorites/activity; use soft deletion with explicit UI semantics and test restoration. Escalate a permanent-erasure requirement separately with a data-retention plan.

## 13. Files and services a coding agent should inspect first

- Product/previous work: `docs/Entertainment-Power-Developer-Handbook.md`, `docs/week3-implementation-plan.md`, `docs/week3-build-log.md`, `docs/HANDOFF_UI_REVAMP.md`. Old UI image files are historical reference only for content inventory, **not** design authority.
- Supplied files: `docs/EPP-Directory-Template.csv`, `docs/EPP-Questions-Template.csv`.
- Mobile theme and UI: `apps/mobile/src/theme/`, `src/components/`, `src/navigation/`, and each `src/features/` area. Inspect `src/services/supabase/` and tests before changing data flow.
- Admin: `apps/admin/src/index.css`, `src/pages/{ContactsPage,ImportPage,QuotesPage,CategoriesPage,TracksPage,TrackChallengesPage}.tsx`, and `src/lib/csvImport.ts`.
- Database: `supabase/migrations/`, `supabase/tests/`, `supabase/functions/`, `supabase/cutovers/week3_paid_entitlement.sql`, and the verified EPP project `knrjhmrsuyzzxlverryl`.
- Build/deployment: `apps/mobile/app.json`, `apps/mobile/eas.json`, EAS project `@bilal06/mobile`, existing Vercel admin project, store dashboards and RevenueCat project. Read live state before modifying it.

## 14. Current documentation to recheck during implementation

- [Supabase RLS and grants](https://supabase.com/docs/guides/database/postgres/row-level-security) for question and assignment tables; new exposed tables need both explicit permissions and row policies.
- [Expo internal APK distribution](https://docs.expo.dev/build/internal-distribution/) and [APK build profile](https://docs.expo.dev/build-reference/apk/) for shareable Android preview builds.
- [Expo Sign in with Apple](https://docs.expo.dev/versions/latest/sdk/apple-authentication/) and [TestFlight distribution](https://docs.expo.dev/submit/testflight/) for native iOS implementation and remote tester delivery.
- [RevenueCat platform sandbox distinctions](https://www.revenuecat.com/docs/test-and-launch/sandbox), [Google Play testing](https://www.revenuecat.com/docs/test-and-launch/sandbox/google-play-store), and [Apple sandbox/TestFlight](https://www.revenuecat.com/docs/test-and-launch/sandbox/apple-app-store) before claiming a purchase path passed.

These links support implementation choices; Bilal's visual brief, client-provided content and observed device/store behavior decide final acceptance.

## 15. Coding-agent execution protocol: how to run each phase

This section turns the preceding milestones into repeatable work. It exists because a compile-only checkpoint is not a tested phase.

### 15.1 Before editing a phase

1. Read the phase, its dependencies, and its acceptance gate completely.
2. Check the working tree and remote `main`; record the starting SHA. Do not fold unrelated files into the phase commit.
3. Inspect the exact source files, tests, current database objects, and rendered screen affected. Verify any claim in the previous build log against current code before relying on it.
4. Capture a reproducible **before** state: screenshot, screen recording or query result, plus a short description of what is wrong. For UI, include viewport dimensions; for persistence, include a test account and pre-action row count or value.
5. Identify all downstream uses of changed tokens, icons, tables, or functions. A theme token changing 20 screens requires a 20-screen visual sweep, not just the screen that motivated the edit.
6. Write a short per-phase task checklist containing file paths, migration filenames generated by the CLI, test names, and devices required. If the work is blocked by content/account access, record the dependency immediately and continue only truly independent work.

### 15.2 During implementation

1. Make the smallest cohesive set of changes that preserves existing auth, directory, tracking, and challenge behavior.
2. Keep app-side network calls in existing service/hook layers. Shared colors, spacing, typography and icons belong in theme/components rather than copied into screens.
3. Keep the mobile preview, production billing, and database environments visibly distinguishable. Do not use a demo-premium account as evidence of paid access.
4. Use incremental commits after an internally coherent, verified change. Commit messages should name the delivered behavior rather than a generic “UI update.”
5. For a database change, verify the intended EPP project ref before execution, inspect existing migration history, test locally/staging, and record an expand/backfill/cutover plan. Do not repair old migration numbers by guesswork.
6. For a content import, inspect file provenance and expected row count, dry-run first, and preserve the original upload for comparison. The admin preview must disclose what will insert, update, skip or reject.
7. Keep a short running log of what was actually run. A test noted in a plan is not evidence that it ran.

### 15.3 Phase sign-off packet

Each phase ends with a packet containing:

- Starting and ending commit SHAs and a scoped diff summary.
- Typecheck/test/build commands with pass/fail counts and the date run.
- Database migration name, local/staging/live status, advisor result, row-count checks, and RLS roles exercised, if applicable.
- Android/iOS device model or emulator name, OS version, APK/IPA/TestFlight build ID, and installed app version for any manual test.
- Screenshots or a short recording proving normal, error, loading, empty, and premium-locked states where relevant.
- A list of Bilal's comments and the exact screen/commit that answers each comment.
- One of **Passed**, **Failed**, **Untested**, or **Blocked** for every gate. “Passed with caveat” is not a fifth status; put caveats next to a genuinely passed item or keep it open.

The next dependent phase begins only after its predecessor's code and available-device gate passes. The final release cannot pass while required real content or platform-sandbox evidence is absent.

## 16. Detailed mobile visual specification and component contract

The supervisor did not supply a new pixel-perfect design file. Use the following concrete interpretation to make the requested look reproducible, then show the five priority screens for Bilal's correction. Do not treat these suggested measurements as more authoritative than his feedback.

### 16.1 Layout geometry

| Element | Starting specification | How to verify |
|---|---|---|
| Phone page canvas | White from top safe area through bottom bar; no dark frame | Screenshot at 360 × 800 dp and 390 × 844 dp |
| Main content width | Symmetric left/right padding, initially 20–24 dp | Compare visible gutters at top, middle, bottom |
| Long form width | Centered column, full available width on small phones, capped sensibly on tablet/web | Keyboard-open and tablet screenshot |
| Vertical rhythm | Reuse 4/8/12/16/24/32 dp spacing scale; avoid arbitrary one-off gaps | Overlay alignment guides on five screens |
| Screen heading | Centered, strong sans hierarchy, enough top breathing room | 200% font scale has no clipping |
| Primary CTA | Prominent, 48–56 dp tall, label at least 18 sp, clear pressed/disabled state | Touch target and font-scaling check |
| Secondary action | Visible outline/text action, not low-contrast pale text | Contrast and tap check on white |
| Cards | White or very light neutral with restrained border/shadow; equal opposing margins | Compact/tall screenshot comparison |
| Bottom tabs | White surface with visible separator; icons/labels horizontally balanced | Five-tab screenshot; no icon clipped at edges |
| Modal/sheet | Light content, dim but non-black opaque backdrop, visible close handle/control | Keyboard and back-gesture test |

Do not use these measurements to force long contact names or translated labels into a fixed-height element. Allow text wrapping and dynamic height. Center the block; left-align long paragraphs, field labels, and list-row metadata *within* the centered block for legibility. This is the deliberate interpretation of “everything centred and symmetrical.” If Bilal wants every text line centered, update the design contract before mass-changing forms.

### 16.2 Type and color checks

1. Keep one modern sans family on Android and iOS; confirm all font files load offline in a standalone build. Do not let a font-loading flash switch from a serif or heavy system default.
2. Define a type scale for hero, page title, section title, body, caption, number, button and tab label. Specify weight, line height and letter spacing in the theme. Review numerals in rings and charts separately from body text.
3. Use dark ink on white for content. Check normal text contrast at WCAG AA 4.5:1 and large text/icon controls at 3:1 where applicable. Test success/error/warning text in context rather than on a color swatch alone.
4. Treat green/orange as intentional accent, not background paint. Gradients may appear in a small brand accent or CTA if Bilal approves; charts and category icons must remain distinguishable without color alone.
5. Verify disabled controls remain readable, show why they are unavailable, and cannot be confused with loading controls.
6. Include a light native status bar, Android navigation bar and splash background. The first native frame and first React frame should not flash dark between them.

### 16.3 Shared component inventory

| Component | Required change | State checks |
|---|---|---|
| `Screen` | White background, symmetric padding, safe area, appropriate scroll/keyboard behavior | Normal, keyboard, system-dark, tall/compact |
| `AppText` | New sans scale and ink colors; button token enlarged | Large font, long text, accessible label |
| `Button` | Larger text, tap target, pressed/disabled/loading design | Rapid tap, pending request, error retry |
| `Logo` | Correct mark/wordmark spacing and single `®` | Raster, accessibility label, compact width |
| `CategoryCard` | One category icon, balanced count/name/chevron | All five categories, zero count, long name |
| `Card`/`SectionHeader` | Light surface and clear hierarchy | Dense lists, no-content, error |
| `BottomSheet` | Light sheet, keyboard/back accessibility | Filter sheet, selection sheet, close gesture |
| `QuoteCard` | Light shareable card, legible actions, no image/photo | Featured/feed/saved, save/share, long quote |
| `CounterControl` | Clear +/−, target, centered value and disabled ends | Zero, one, max, rapid taps |
| `MomentumCard`/charts | Light chart grid and non-color-only labels | Zero goal, max count, 8-week gaps |
| `MainTabNavigator` | Light bar, balanced five icons, selected state | Every tab and keyboard-open layout |

### 16.4 Brand and imagery audit procedure

1. Inventory runtime image imports (`Image`, `expo-image`, `ImageBackground`, `require` of raster assets) and bundled assets. Classify each as logo, category icon, functional icon, human image, or unused legacy file.
2. Remove all rendering paths for human images, especially the concert crowd on intro slides. Unused historical image files can remain in `docs/` as archive, but not be bundled or displayed.
3. Inspect `logo-full.png`, `logo-mark.png`, app icon and splash asset at native resolution. If the source artwork includes a wordmark but no `®`, add the registered symbol in a legible vector/text layer or produce an approved replacement asset. Avoid scaling a tiny raster ® until it blurs.
4. Search UI-facing strings for full brand phrase, including accessibility labels, onboarding, admin, email/deep-link landing copy, export/share card and demo video. Add `®` once. Do not alter historical database text, domains, package IDs or OAuth app IDs.
5. Review all five category names and their icons side by side in both mobile and admin. A stylized eyeglasses glyph is acceptable only if Bilal agrees that it clearly reads as sunglasses; otherwise make a purpose-built sunglasses vector.
6. Capture a full screen recording from cold launch to Profile to catch transient dark flashes that still screenshots miss.

## 17. Priority-screen interaction specifications and negative cases

### 17.1 Splash and auth handoff

1. Cold launch while signed out: white native splash → lower centered brand → short transition → intro or login; no black frame.
2. Cold launch with existing session and selected tracks: splash waits for hydration and reaches Home without flashing login.
3. Existing session with no selected tracks: reach track picker exactly once; returning after selection should not loop.
4. Expired session: show signed-out path with a recoverable message, not a spinner forever.
5. Slow backend or offline launch: show visible progress or retry state. Preserve locally cached information according to existing app policy.
6. Test animation interruption by backgrounding and foregrounding mid-splash; navigation should happen once.

### 17.2 Directory category → list → detail

1. Five category cards always have correct canonical icon, readable name, accurate live count and an accessible action label.
2. Searching while a category is selected must not leak contacts from another category unless the UI explicitly changes to global search. Empty query restores the full category list.
3. Role/city/favorites filters combine predictably, show active filter count, and have a one-tap clear action.
4. The A–Z rail jumps to the actual first result under that letter and does not reset to list top. Letters with no results are visibly inactive.
5. Search term, selected filters and scroll position survive detail open/back within the same session.
6. Free users see only the intended teaser/category information; direct navigation/deep link cannot reveal a paid contact through cached data or Supabase query.
7. Detail shows city if present, preserves punctuation and accented names, and never renders an absent method as an apparently tappable action.
8. Call, email and website controls open valid device handlers. Failed or unsupported URLs show a helpful message instead of a silent no-op.
9. Favorite and Add to Tracker state changes are reflected immediately, remain correct after back/reopen, and persist after force stop and login on another device when server-backed.
10. Deactivated/deleted contacts disappear from active search while existing tracker history remains understandable.

### 17.3 Tracker dashboard → log → history

1. Today's week key is shown in human-readable form and aligns with stored `week_key`; counts and chart use the same boundary.
2. Main contacts ratio has its numerator and denominator optically centered even for `1/5`, `10/10` and a zero goal. The ring fill caps visually at 100%, while text may show a count above target.
3. Three bars each name the log type, current count, goal, and “No goal set” behavior. A count of zero is visible, not a blank bar.
4. Eight weeks are ordered oldest → newest, include zero-activity weeks and keep labels meaningful around year change.
5. Contact logs may link an allowed directory record or use manual text; free accounts never obtain paid contact details from the picker.
6. Event logs preserve selected local date/time; follow-up logs preserve target/name and notes. Every save shows pending, success and failure without duplicating a row on repeat tap.
7. History includes each persisted row once, challenge completions only while complete, and a visible route or explanation for editing a challenge-derived entry.
8. Swipe-delete and its accessible button agree. Confirm before deleting manual activity, show pending state, remove the exact server row, and roll back optimistic UI if server delete fails.
9. Reopen after force stop and compare all three counts, bars, week chart and history to server data.

### 17.4 Challenges list → track → challenge

1. “My Tracks” and “All Tracks” respect the persisted selection and active-track list; empty selected tracks have a useful recovery path.
2. Each row has correct canonical category icon and a progress count computed from active challenge IDs, not display position.
3. Free accounts can see only allowed track-level teaser data and cannot fetch challenge details from a deep link.
4. A single challenge toggles complete/incomplete; a counter increments/decrements within `[0,target]`; notes save without creating duplicate history.
5. Rapid taps serialize correctly; a failed request does not leave a false completed UI state.
6. A completed challenge produces exactly one linked Tracker history record. Uncomplete removes that exact record; title edits do not break the link.
7. An admin type/target edit follows the documented reconciliation semantics after the stable-ID migration. The detail screen refreshes while still open, showing the new target and correct member count.
8. Reorder does not attach a member's progress to a different challenge; keep the feature gate closed until compatible-app rollout is proven.
9. Test a challenge deactivated while open: show a graceful unavailable state and preserve historical progress without a crash.

## 18. Questions content specification: schema, import, and screen behavior

Bilal gave a count and an attached CSV *shape*, but not the final 125 rows, scoring rules, a separate navigation tab, or whether question answers should be private until reveal. The plan makes the smallest complete learning module and records these choices so an agent does not improvise silently.

### 18.1 Proposed `questions` record

| Field | Storage/validation | User-visible use |
|---|---|---|
| `id` | Stable UUID primary key, generated by database | Route/progress identity across edits |
| `category_slug` | FK to existing `categories.slug`, required | Category grouping/icon and filter |
| `challenge_group` | Nonblank text, whitespace-normalized for matching; retain display spelling | Group title such as “Know the Industry” |
| `number` | Positive integer, unique within verified category/group key | Within-group ordering and “n of m” |
| `question` | Nonblank text, sensible maximum after inspecting final data | Prompt before answer reveal |
| `answer` | Nonblank text, preserve punctuation/newlines | First reveal panel |
| `why` | Nonblank text unless client file establishes a permitted optional rule | Context/explanation panel |
| `power_move` | Nonblank text unless final contract changes | Practical-action panel |
| `active` | Boolean default true | Hide from active browsing without losing references |
| `created_at`, `updated_at` | Server timestamps | Audit/freshness and edit behavior |
| `import_batch_id` or source fingerprint | Optional internal metadata, not user writable | Reconcile re-imports and investigate errors |

Do **not** use CSV row number as the question ID: sorting a spreadsheet must not reset progress. Before enforcing `(category_slug, challenge_group, number)` uniqueness, validate whether the final source uses repeated numbers across groups and whether group names vary only by case/space. If the natural key is not stable enough, require an external ID column in a revised client-approved template rather than guessing matches.

### 18.2 Suggested member progress contract

- Begin with only the progress state the UI actually needs. Suggested fields: `user_id`, `question_id`, `first_opened_at`, `revealed_at`, `completed_at`, `updated_at`; PK `(user_id, question_id)` and FKs to user/question. Allow a nullable timestamp for each transition.
- The member may update only their own row. Admins edit question content, not member progress. A question edit leaves the row attached to the same ID; deactivation hides the question from new browsing but keeps historical progress.
- Decide whether “complete” means answer revealed, power move viewed, or a deliberate “Mark complete” tap. Recommended default is an explicit tap after the power move, so opening a card does not silently complete it. Put the decision in the Phase 0 review sheet.
- If Bilal does not want completion tracking, omit this table and all progress badges. A false progress meter is worse than no progress meter.

### 18.3 Database authorization and performance cases

1. RLS enabled on every new exposed table. Test direct REST/Data API access as anon, free signed-in, pro, other user and admin.
2. Under the proposed premium placement, pro members read active questions; admin reads/manages active and inactive; free users see only allowed group/category teasers if separately modeled. Do not expose `answer` through a free teaser query or a security-definer helper.
3. `question_progress` select/insert/update/delete is owner-scoped if delete is needed; no member can set `user_id` to another account. Use both `USING` and `WITH CHECK` for updates.
4. Explicit table privileges and function execution grants complement RLS. Revoke default public execution on privileged import/transition functions; verify function owner/search path and caller authorization.
5. Index category/group/number for browsing, user ID as leading key for member progress, and non-leading FK columns that need joins/deletion checks. Run `EXPLAIN` on realistic 125-row and future-growth queries; avoid indexes that duplicate a PK.
6. Make the migration additive and short. Test with existing users, existing categories, and repeated deployment on a throwaway database. Confirm no production content is deleted during a retry.

### 18.4 Exact CSV validation report

The importer must output, before any write:

| Check | Example failure message |
|---|---|
| Required header missing | `Missing column: power_move` |
| Unexpected header | `Unmapped column: source_note` with explicit map/ignore option |
| Blank prompt/answer | `Row 18: question is empty` |
| Unknown category | `Row 22: category "Fashion & Style" is not configured` |
| Invalid number | `Row 31: number "3.5" must be a positive whole number` |
| Duplicate in file | `Rows 7 and 42 both identify Fashion / Know the Industry / 4` |
| Already stored | `Row 13 matches an existing question; update/skip choice required` |
| Parser error | Physical line/CSV row and reason, including unclosed quote |
| Count discrepancy | `122 distinct valid rows; 125 required for publication` |

CSV parsers can count physical lines differently when a quoted field contains a newline. Report both a human-readable CSV row number and parser location where available; do not mislabel a multiline answer as two questions. Keep raw input, normalized preview, and the resulting inserted/updated/rejected totals separate.

### 18.5 Questions screen acceptance script

1. From Challenges, open Questions; observe five categories or only those with active content, according to the approved rule. Icons match the canonical set.
2. Open a category, see groups in stable order and a count that matches database active rows.
3. Open the first question: prompt visible, answer hidden, number and “n of m” correct.
4. Tap Reveal: answer appears, followed by Why and Power Move in an intentional reading order. Screen reader focus moves sensibly; no inaccessible hidden text is announced prematurely.
5. Navigate next/back; no duplicate or skipped question; return to the group and reopen the same question.
6. Force stop/relaunch; if progress is approved, completion state remains for the same account and does not appear for a second account.
7. Edit question copy in admin while detail is open; content updates without changing ID or losing progress. Deactivate and restore; no crash, stale-content leak or false completion count.
8. Repeat with a long answer, apostrophes, quoted CSV text, emoji/Unicode, no connection, and server error.

## 19. Quote rotation engineering contract and proof strategy

### 19.1 Why the current selector is insufficient

`apps/mobile/src/services/mock/quotes.ts` computes a hash of the *date only* and selects `hash % active.length`. It makes every member see the same daily quote and does not check previous assignments. It cannot prove 32 weeks without repetition, and app reinstall or content order changes can remap the same day. The new rule requires persisted per-user assignment.

### 19.2 Allocation transaction, in order

1. Authenticate the caller and derive their immutable Supabase UUID. Read their server-stored IANA timezone; if absent, default to a documented timezone, record it, and allow a user setting to change it later.
2. Calculate the member's **current local date from server time**. An arbitrary date parameter from the phone is not authoritative.
3. Acquire a short transaction-scoped lock for that user (row lock or advisory transaction lock with a stable key). This protects the check/choose/insert sequence on two devices.
4. Query `daily_quote_assignments` for `(user_id, local_date)`. If present, return that row and snapshot immediately. The current day's assignment does not change on refresh or after an admin edit.
5. Query active quote IDs except IDs assigned to that user on the **224 local dates before today**. Sort consistently, then select by a seeded per-user/day permutation or least-recently-used rule; document it and make tests deterministic.
6. If no eligible quote exists, return a typed configuration failure and alert admin operations. Do not silently fall back to the current date hash or a repeated quote.
7. Insert the assignment and a text/author snapshot, handle unique-key conflict by reading the concurrent winner, commit, and return the committed record.
8. Return only owner-visible assignment data to the mobile client. The Explore feed remains a separate active-quote query and may contain past/future daily quotes; saved items remain tied to stable quote IDs.

### 19.3 Rotation invariants and edge cases

| Invariant | Test |
|---|---|
| Same member/date returns same ID | Repeat API call 20 times and reinstall client |
| Different accounts isolated | Two users can have independent histories; one cannot read other's assignment |
| No repeat in previous 224 dates | Simulate 225 active quotes over 225 consecutive local dates |
| Exact boundary | On local day 225 the earliest quote is still excluded if it lies inside the 224-day lookback; on later days reuse is allowed only outside it |
| Two phones race | 20 concurrent calls produce one DB row and one returned quote ID |
| Midnight and DST | UTC timestamp converted to stored timezone yields one local day; no accidental double assignment |
| Offline opening | Show cached current assignment with a freshness label or recoverable loading state; never invent a new quote offline |
| Content edit | Today's snapshot stays consistent; future assignments use updated text |
| Content deactivation | Historical assignment remains readable; deactivated quote is excluded from new draws |
| Insufficient pool | Clear operational failure, no hidden violation of the 32-week promise |

The phrase “no repeat for 32 weeks” is about a **rolling 224-local-day window**, not merely “rotate through all 225 once.” A hash over 225 items can collide the next day; a simple modulo over a mutable order can also break after admin edits. Tests must inspect persisted quote IDs, not only text rendered in a mocked card.

### 19.4 225-content import conditions

- Client supplies text and author (and any agreed rights/source information) in a reviewable file. Check author spelling and duplicate text; distinguish intentional variants from accidental duplicates before import.
- Import report gives original count, valid count, distinct active count, existing-row matches, rejected rows and inactive rows. Release requires **225 distinct active selectable quotes** after import, not 225 CSV lines.
- Do not delete or replace existing saved quote IDs when merging new content. If old demo quotes remain active, they count only if Bilal approves them as part of the final 225 and their rights/source are accepted.
- Admin UI warns if deactivating quotes would leave fewer than the minimum pool needed to honor the 224-day exclusion. A reactivation is a recoverable remedy; no user-history purge is permitted just to make the algorithm pass.

## 20. Contact admin/import specification down to field behavior

### 20.1 Field mapping for the exact supplied template

| CSV header | Existing database field | Normalization and validation |
|---|---|---|
| `name` | `contacts.name` plus derived `name_lower`, `sort_key` | Trim outer whitespace; nonblank; preserve accents/case in display |
| `category` | `category_slug` FK | Map names such as `Film/TV` to an existing slug; reject unknown |
| `role` | `role` | Trim; allow empty only if product rule permits; check current schema behavior |
| `company` | `company` | Blank → `NULL`; preserve spelling |
| `email` | `email` | Blank → `NULL`; validate nonblank email; no lowercasing of display unless needed |
| `phone` | `phone` | Blank → `NULL`; retain `+`, extension and spacing; test tel URI construction |
| `website` | `website` | Blank → `NULL`; validate supported HTTPS/HTTP URL; normalize only with preview |
| `city` | `city` | Blank → `NULL`; displayed in contact detail and filter values |
| `notes` | `notes` | Blank → `NULL`; preserve quoted commas/newlines safely |

`active=true` is the default for newly imported records. `updated_at` is server-updated or deliberately written once; never accept an `updated_at` column from an untrusted CSV. Contact IDs are generated by the database. The template has no stable external ID, so automatic upsert by `name` alone is unsafe.

### 20.2 Import runbook

1. Select file; validate extension, size and UTF-8 decoding. Show reading progress and reject a blank or header-only file.
2. Parse with error reporting. Detect duplicate headers after case/space normalization, blank column names, mismatched column counts, quoted newlines and excess columns.
3. Map every header. Show which optional fields are empty and which columns are ignored. Require confirmation before ignoring an unknown column.
4. Load categories from the same EPP/staging environment that will receive the rows. If category fetch fails, stop; never skip category validation.
5. Validate each data row independently and display first ten normalized previews. Report counts: valid, invalid, probable duplicate, insert, explicit update, skip.
6. Let admin download/copy a rejection report with row number and reason. Avoid exposing contact email/phone in diagnostic logs sent to third parties.
7. Confirm the import mode, then write in bounded batches. A batch failure should stop further batches, keep a retriable report and preserve successfully committed rows without lying about them.
8. Rerun the same file in dry-run mode; it should show no unintended new insertions. Verify counts and spot-check name, category, city and optional contact methods in both admin and mobile.
9. For the supplied three-row **sample**, use disposable staging IDs; deactivate/delete the samples after the acceptance test if that was the agreed staging cleanup, not from the live client directory.

### 20.3 CRUD and deletion detail

- “Add” opens a clean form with selected category, required-field indication, clear Save/Cancel and pending state. Double Save should create one row.
- “Edit” prepopulates every stored field and preserves contact ID/favorites/activity links. Category change updates list membership and filters without creating a duplicate contact.
- “Delete” action must confirm contact name and explain the current soft-delete behavior. It sets `active=false`, hides the row from member directory results, and keeps a Restorable/Inactive view for admins.
- “Restore” returns the same ID and linked favorites. If a client later requests permanent erasure, build a separate retention-safe operation with reference impact review.
- Non-admin member cannot reach or mutate contacts through the admin client even if they call the Supabase endpoint directly. Admin action errors must remain visible after modal close/reopen.
- A contact currently open in mobile should disappear or display an unavailable state within the documented live-refresh interval after deactivation; it must not remain as an indefinitely tappable stale card.

## 21. Subscription, Apple sign-in, and entitlement test runbooks

### 21.1 Build profiles and environment separation

| Build purpose | EAS profile/environment | Allowed entitlement path | Distribution and proof |
|---|---|---|---|
| Existing client preview | `preview`, current `b56cb4b` artifact | `activate_preview_plan` demo, explicitly labeled | Private APK for visual/general app review; not purchase proof |
| Redesigned client preview | New preview build after UI gates | Demo only while billing keys are absent | Private APK plus SHA/commit and install smoke |
| Android billing test | Separate profile or preview environment with Android RevenueCat public key and demo flag off | Google Play sandbox → webhook/reconciliation → server entitlement | Play-recognized test track/account; transaction and RLS proof |
| iOS billing test | Store/TestFlight build with Apple RevenueCat public key and demo flag off | Apple sandbox → webhook/reconciliation → server entitlement | Signed IPA/TestFlight, physical iPhone test |
| Production candidate | `production`, real platform keys and no demo flag | Paid server-only entitlement after cutover | Store submission candidate only after all gates |

For each build, record the resolved **names and presence** of required environment variables without printing secret values. Verify that `EXPO_PUBLIC_` variables are public client values and never contain a service role, webhook secret or RevenueCat private key. Use a build-time assertion or test that a billing build cannot render “Activate Premium (test).”

### 21.2 Product setup checklist

1. Confirm app package/bundle IDs in `apps/mobile/app.json` match Google Play, App Store Connect and RevenueCat app registrations.
2. Configure monthly and annual products on each store with the approved names, durations, territories and prices. Record product IDs and screenshots of configuration in private operations notes.
3. Ensure **no introductory free trial** is attached to either product. Inspect base plans/offers on Google Play and subscription introductory/promotional offers on Apple, not just the paywall text.
4. Attach both products to one current RevenueCat offering and one `pro` entitlement. Confirm package identifiers map to monthly and annual exactly once.
5. Configure platform-specific public SDK keys in EAS build environments. Configure RevenueCat webhook Authorization/HMAC and server API key as Supabase Edge Function secrets; keep them out of Git and frontends.
6. Confirm RevenueCat sandbox access policy, expected app identifiers and environment filtering. A sandbox event must not confer production access to an unintended account.
7. Prepare one fresh tester per plan/platform and a second device or reinstall route for restore. Test accounts must be distinguishable by Supabase UUID, not email alone.

### 21.3 Android purchase script

1. Publish/install the signed billing build through the approved Google Play testing route. Add the tester to license testing and the test track, and complete the track opt-in link using the same Play account on the device.
2. Create or log into a **fresh Supabase account**; record sanitized UUID and build version. Confirm free access is denied by direct RLS query and by app UI.
3. Open paywall; verify two plans, localized prices, subscription period and no “free trial” or intro claim. Check selected state and accessible button labels.
4. Buy monthly using a Google Play test payment method. Record purchase sheet outcome and RevenueCat sandbox transaction ID privately.
5. Confirm webhook or authenticated reconciliation writes matching server subscription state for the **same** UUID, then `is_pro()` and RLS allow contacts/challenge details. Force stop and reopen; access remains.
6. Repeat annual with a separate clean account. Do not reuse a prior subscription and misinterpret restore as new purchase.
7. Cancel one tester's auto-renewal. Verify access lasts until paid-through date; after accelerated sandbox expiry or explicit revocation, server RLS denies gated rows and app UI refreshes.
8. Restore on a second device/reinstall and verify it unlocks only the correct UUID under the approved transfer policy. Test wrong account, user-cancelled sheet, store error and temporary webhook delay.

### 21.4 iOS/Apple script for a remote physical tester

The coding agent prepares the build and script; the tester performs physical-device actions. Do not ask the tester to share passwords, full receipts, payment details, or unredacted personal data.

1. Confirm Apple Developer team, app ID, Sign in with Apple capability, App Store Connect subscription products, agreements and TestFlight tester access. A missing store agreement can block product retrieval even if the code is correct.
2. Build signed iOS IPA with EAS and submit to TestFlight. Record bundle ID, app version/build number, EAS build ID and TestFlight processing status.
3. Tester installs on an iPhone and records model/iOS version. Fresh install → Continue with Apple → choose share/hide email → verify Supabase session, profile name fallback and correct route. Repeat returning sign-in and cancelled sign-in.
4. Tester opens paywall: monthly and annual visible, no trial; performs a sandbox monthly purchase. Collect screen recording from plan selection through unlocked contact/challenge screen without showing private account details.
5. Coding agent cross-checks RevenueCat transaction/environment, webhook invocation, subscription row, `is_pro()` and RLS using sanitized UUID and tester timestamp.
6. Repeat annual with a distinct test account; test restore, cancellation and expiry. If time only permits one product, mark the other **Untested**, not passed.
7. Tester signs out and signs in as another Supabase account; verify cached premium data is cleared and the other account remains gated. Check restore/transfer result deliberately.
8. After test, gather a short pass/fail form for each step, relevant screenshot, device/build metadata and any error dialog text. Reproduce/diagnose failures using logs before another build.

An iOS simulator can help with layout and limited Apple-auth/StoreKit development, but it is not the promised physical TestFlight acceptance. The final report must name the remote tester/device evidence or state that iOS purchase/Apple sign-in remains unverified.

### 21.5 Webhook and RLS checks

- Missing/wrong webhook Authorization or signature returns a denial and creates no entitlement row.
- A valid event for an unknown app ID, unexpected product, wrong environment or unknown user UUID grants nothing.
- Duplicate event ID is idempotent; older out-of-order events cannot regress a newer active subscription.
- Cancellation changes renewal state while retaining access through paid-until; expiry/refund/transfer removes access according to the approved policy.
- A user cannot write `subscription_status`, `profile_entitlements`, or event receipts through the client API.
- Free-user, pro-user and admin content policies are tested separately. Admin content management must not depend on purchasing.
- After paid cutover, the preview RPC is unavailable in the paid environment and no old `test_pro` flag grants paid access. A preview APK must be explicitly classified as incompatible with that environment if its demo path is disabled.

## 22. Per-phase test inventory with pass/fail observations

The tests here are concrete scripts to execute, not a claim that they currently pass. Use disposable users and staging data when a scenario mutates content.

### Phase 0 observations

- Current APK downloads, checksum matches local copy, Android package installs, app launches without Expo Go/Metro, and login reaches Home.
- Current preview premium control clearly says test/demo; current EPP backend and APK build commit are recorded.
- Baseline mobile/admin test counts are captured without suppressing failures; Supabase project identity is verified.
- Two CSV files parse to the expected headers and exactly 3/2 example rows respectively; production-content counts are explicitly unknown.

### Phase 1 observations

- Five normal-state screenshots show white canvas, one `®`, no people image, sunglasses and basketball in relevant contexts, centered composition and 18+ sp primary button labels.
- Splash authentication race tests still pass; directory A–Z and filters move to the correct records; contact methods and city render; tracker ring text remains centered; challenge progress persists.
- Each of five screen families has at least one failure/empty/locked-state screenshot where applicable.
- On-device flow from splash through challenge detail completes without a dead button or invisible bottom tab.
- Bilal receives only the five-screen review package; his feedback is logged with specific corrections.

### Phase 2 observations

- Every route in §5.1 has been visited at least once in a signed-out/free/pro context as applicable; no dark surface or portrait remains.
- Sign-up, password reset/deep link, Google sign-in, Profile save/logout, quote save/share, tracker editors, paywall close/return and admin modals still work.
- All five category icons match the canonical map in app/admin; Sports never shows trophy or football; Fashion reads as sunglasses.
- Android and iOS-sized screenshots show no clipped CTA, no off-screen modal and no white text on white background.

### Phase 3 observations

- Local migration creates expected tables/constraints/indexes and leaves existing users and challenge data untouched.
- Non-admin cannot import/edit questions; user A cannot read/write user B's progress; free/pro behavior matches chosen policy.
- Two-row supplied template imports in staging; a re-upload yields zero accidental new rows; malformed and 125 synthetic row tests pass.
- **Actual 125 client rows** are counted and reviewed only after delivered; until then milestone content status is Blocked.

### Phase 4 observations

- Question category → group → card → reveal → next/back flow works on device, including long text and empty/error state.
- Synthetic 225 quote set yields no repeated assigned ID in a moving 224-day window; same-day calls stay stable and users are isolated.
- Real quote-content status stays Blocked until 225 active client-approved rows exist; all feed-card save/share actions still work.

### Phase 5 observations

- Add/edit/deactivate/restore retain same contact ID; app reflects change without restart within documented refresh interval.
- Exact sample template shows 3 valid rows and correctly populates city/optional values on staging; re-import does not create duplicates.
- Mixed malformed file identifies exact rejected rows; 2,000-row synthetic import finishes with accurate totals; admin non-admin access test passes.
- Deployed Vercel admin matches commit and EPP backend; a browser test verifies controls, not only a local production build.

### Phase 6 observations

- Monthly and annual products appear from each real store, without a trial offer or trial copy; no hardcoded fake price appears.
- Android sandbox and physical-iPhone Apple sandbox each show one new purchase reaching server entitlement/RLS and one restore. Negative and expiry cases are recorded.
- Apple sign-in is implemented, not a redirect-to-signup placeholder, and has remote iPhone proof.
- Demo premium and paid billing are separated by build profile and database policy. The paid cutover is documented and approved after sandbox proof.

### Phase 7 observations

- Fresh APK and iOS build IDs map to final commit, install, and show the light UI. APK runs without a bundler connection.
- Short demo shows representative member and admin paths with no real personal data.
- No P0/P1 defects; content counts and quote-rotation query check match acceptance; final status report lists every untested/blocked item honestly.

## 23. Failure triage and rollback guidance

| Failure | Immediate response | Completion check |
|---|---|---|
| Shared theme makes a screen unreadable | Restore contrast/spacing in token or component, then re-audit every consumer | Screenshot matrix and screen-reader pass |
| APK launch/update error | Inspect EAS build/profile/runtime, install cleanly and offline, check native logs | Three cold launches without Metro/remote update dependency |
| Supabase migration mismatch | Stop automatic push; compare live/local version+schema, devise forward-only reconciliation | Verified intended EPP schema and migration record |
| Question CSV partial import | Preserve report and successful IDs, use idempotent retry/diff | Counts and sample rows reconcile; no duplicates |
| Quote pool below 225 | Re-enable approved quotes or await client content; show admin alert | 225 active distinct; 224-day exclusion test passes |
| Contact CSV duplicate | Pause import and review normalized candidate vs existing row | Explicit insert/update/skip decision, no silent overwrite |
| Wrong premium user unlocked | Disable relevant paid test path, inspect UUID mapping, webhook/event ledger and RLS | Other user denied; correct owner restored |
| Apple product absent in TestFlight | Check product approval/territory/agreement, bundle ID, RevenueCat mapping and sandbox account | Two packages visible on physical tester device |
| Apple sign-in only displays placeholder | Implement capability/native flow and rebuild | Supabase session on physical iPhone, repeat login passes |

For an app code regression, make a targeted forward fix or revert of a scoped commit after checking its dependencies. For a database regression, make a forward repair that preserves member data; do not delete progress or reset live schema for convenience. A rollout blocker remains visible in the final report rather than being hidden by a demo path.

## 24. Final private handoff package, file by file

| Deliverable | Contents | Verification |
|---|---|---|
| Android APK | Fresh signed standalone APK; version code; SHA-256; EAS build ID; profile label | Installs and launches on Android without Expo Go |
| iOS build | Signed build/IPA or TestFlight link; bundle/build number; Apple team/tester status | Installed/TestFlight processed; physical-device result separately recorded |
| Design evidence | Five priority screens plus remaining-screen gallery; category icon sheet; final short demo video | Bilal's rules visually pass and feedback resolved |
| Backend evidence | EPP migration list, question/quote counts, quote assignment test, RLS matrix, webhook results | No synthetic content counted as production |
| Admin evidence | Vercel deployment URL/build ID; CRUD and CSV import report with provided template | Browser test and app refresh pass |
| QA report | Passed/Failed/Untested/Blocked matrix by platform/build/account; known issues and reproduction | Every required claim has a test or an honest open gate |
| Operational note | How to add future questions/quotes/contacts, restore a deactivated contact, monitor quote pool and billing, rotate keys | Admin can perform routine updates without editing code |

The handoff message to Bilal should begin with what he can install and review, then the backend choice (Supabase), then the platform test status. Keep raw admin credentials, service keys, private tester emails, phone numbers and store receipts out of the package. If the content or iPhone tester has not arrived, deliver the completed artifacts with that exact limitation instead of promising that an untested final build is finished.

## 25. Requirement-to-evidence ledger for the final reviewer

Use this ledger as the final sign-off index. Add a link or local artifact path and a Passed/Failed/Untested/Blocked status to each ID in the execution log.

| ID | Supervisor requirement | Primary phase | Evidence required |
|---|---|---|---|
| D01 | White/light theme | 1–2 | Full route screenshots including native bars, sheets and admin |
| D02 | Contemporary sans serif | 1–2 | Theme/font audit, offline build screenshot |
| D03 | Centered symmetrical layout | 1–2 | Compact/tall layout comparisons |
| D04 | Logo lower and wordmark closer | 1 | Splash screenshot/video and Bilal review |
| D05 | `®` after full brand everywhere | 1–2 | Visible-string/asset checklist, no duplicates |
| D06 | Bigger button text | 1–2 | Token value plus device screenshot/large-text check |
| D07 | No images of people | 1–2 | Asset/runtime import audit and full-route recording |
| D08 | Category icons only; Fashion sunglasses | 1–2 | Icon sheet, directory and track screenshots |
| D09 | Sports basketball | 1–2 | Icon sheet plus app/admin/server mapping check |
| D10 | Vibrant minimal feel | 1–2 | Bilal visual approval of five-screen review and final gallery |
| S01 | Splash, directory, contact detail, tracker, challenges | 1 | Five-screen package plus functional smoke |
| S02 | Theme on all remaining screens | 2 | Route/state matrix |
| Q01 | Questions data model | 3 | Migration/RLS/query tests |
| Q02 | Import 125 real questions | 3 | Client file hash, dry-run, exactly 125 valid active rows |
| Q03 | Questions screens | 4 | Device journey and persistence checks |
| I01 | 225 real quotes | 4 | Client file import report, 225 distinct active rows |
| I02 | No quote repeat for 32 weeks per user | 4 | Persisted 224-day window test and two-account test |
| A01 | Admin add/edit/delete contact | 5 | Deployed browser and mobile reflection checks |
| A02 | Directory template CSV import | 5 | Exact three-row staging result, malformed and 2,000-row tests |
| B01 | Two plans; no free trial | 6 | Store/RevenueCat configuration and paywall on both platforms |
| B02 | Real purchases and restore | 6 | Android + physical-iPhone sandbox, server/RLS proof |
| B03 | Sign in with Apple | 6 | Physical-iPhone login and repeat login, Supabase session |
| H01 | Today's current APK/backend/Apple-test reply | 0 | Private message to Bilal with accurately labeled preview APK |
| H02 | Fresh final APK | 7 | Final SHA/build ID/checksum/install test |
| H03 | iOS build | 7 | EAS/TestFlight artifact and installation status |
| H04 | Short demo video | 7 | Private video link/file and reviewed content |

The reviewer closes a row only when its evidence exists. A code commit, unit test, build, deployment and client acceptance are different events; record each separately.
