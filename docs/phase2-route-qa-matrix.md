# Phase 2 light-theme route and state QA matrix

Updated 5 October 2026. This is execution evidence for [the supervisor plan](supervisor-oct-3-9-implementation-plan.md), not a claim that every route has passed. Bilal accepted Phase 1 visuals in Expo Go. Browser `?preview=` captures use synthetic development-only data; they do not prove native layout, Supabase writes, store purchases, or admin authorization.

Legend: **reviewed** = code plus available browser frame reviewed; **tested** = an automated behavior test exists and passed; **open** = no sufficient route/state evidence yet. Private captures are outside Git under `/tmp/`.

| Area / route | Visual/state evidence | Functional evidence / open checks |
|---|---|---|
| Splash | Reviewed at 360×800 and 390×844; Bilal approved Expo Go appearance | Fast-auth race test passes; fresh native icon/startup and offline path remain separate QA |
| Intro slides 1–3 | Reviewed at 360×800; slide 2 width regression and slide 3 icon symmetry corrected | Bilal approved the repaired appearance; next/back/get-started route smoke still needed |
| Login / signup / forgot / reset / callback | Light shared form tokens in code; route captures open | Existing auth routing/deep-link tests pass; real email/Google and keyboard/safe-area matrix open |
| Track picker | Reviewed at 360×800 with five fixed category glyphs; selected state via code | Track-save path unchanged; first-signup live save/reopen confirmation open |
| Home / five tabs | Home and navigation reviewed at 360×800; category/icon audit ongoing | Tab-navigation tests pass; portrait-only layout configured; large text/system-dark pass open |
| Directory grid/list | Reviewed at compact/tall sizes, including locked/empty list states | Search/filter/A–Z/contact navigation tests pass; loading/error/native scrolling spot check open |
| Contact detail | Reviewed at compact/tall, locked and long-content states | Methods/error/favorite/tracker tests pass; native URL handlers and premium state spot check open |
| Tracker / log selector / forms / goals / history | Dashboard reviewed at compact/tall; follow-on route captures open | Activity, goals, history and week tests pass; native keyboard, swipe delete, week rollover spot check open |
| Challenges / track / detail | Reviewed at compact/tall, locked/empty states | Progress/note persistence and navigation tests pass; live admin edit/deactivation and target-change spot check open |
| Inspiration / Saved / share | Quote feed and hero reviewed at 360×800 with synthetic preview quotes | Save/share tests pass; share image/light export on physical phone open |
| Paywall / Profile subscription | Paywall reviewed at 360×800; monthly/annual cards visible | Navigation/billing bridge tests pass; live store flow belongs to Phase 6, not this visual pass |
| Profile / edit / notifications / settings | Profile reviewed at 360×800; follow-on captures open | Name, selected-track and preference tests pass; keyboard, validation, logout and account actions open |
| Admin login / contacts | Light login and contacts previews available from earlier pass | Admin auth and CRUD on deployed site open |
| Admin categories | Reviewed at 1280×800 and 390×844 in `/tmp/epp-phase2-admin/`; fixed five-icon mapping tested | Preview is read-only/synthetic; authenticated live Save and deployed-site check open |
| Admin home / import / quotes / tracks / challenges | Light CSS applied; route-by-route captures open | Admin suite/build pass; authenticated CRUD and table responsiveness open |

## Current source and asset audit

- Mobile roots/native config request white/light appearance; `Screen` uses white and the aurora is suppressed under the supervisor brief. Visible people photos are not rendered: profile avatars show initials and the old concert image is no longer referenced by runtime code. The historical `assets/onboarding-concert.png` is still stored but not bundled by a render path.
- `CategoryGlyph` is the mobile slug-based source of truth. Admin now calls `canonicalCategoryIcon(slug)`, so Fashion renders sunglasses and Sports a basketball even though the live EPP category rows still store legacy `diamond-outline`/`trophy-outline` values. The admin selector no longer permits reintroducing old choices. Unknown slugs show neutral shapes plus a warning. No production category row was mutated for this UI mapping.
- Visible full-brand strings and the mobile `Logo` accessibility label include `®`; `logo-full.png` artwork contains a single registered mark. Dark standalone app-icon artwork still deserves a separate native/brand check; it is not being silently counted as passed.
- Admin categories screenshot and local tests do not establish Vercel deployment. Record build ID and test the authenticated deployed route before the Phase 2 gate closes.
