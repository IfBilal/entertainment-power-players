# Phase 2 light-theme route and state QA matrix

Updated 6 October 2026. This is execution evidence for [the supervisor plan](supervisor-oct-3-9-implementation-plan.md). Browser `?preview=` captures use synthetic development-only data, so they show layout and state, not native behaviour, Supabase writes or store purchases.

Legend: **visual** = frame reviewed at 360×800 and 390×844; **locked** = gated state frame reviewed; **tested** = automated behaviour test passed; **device open** = needs a physical phone or emulator, not yet run.

Frames: the full route pass is in `/tmp/claude-1000-phase2/final/` and the locked-state frames are in `/tmp/claude-1000-phase2/locked/`. These are private captures outside Git.

| Area / route | Visual evidence | Functional evidence / device open |
|---|---|---|
| Splash | Visual, white canvas, `®` on wordmark | Fast-auth race test passed; native icon and cold start are device open |
| Intro slides 1–3 | Visual; counter now centred; sunglasses and basketball shown | Next/back/get-started route smoke: device open |
| Login / sign-up / forgot / reset | Visual; disabled buttons neutral and readable; back link centred | Apple placeholder tests passed; real email/Google sign-in and deep link return: device open |
| Track picker | Visual; symmetrical five-card grid | First-sign-up save and reopen: device open |
| Home | Visual; ring and bars centred | Tab navigation tests passed; large text and system dark: device open |
| Directory (categories) | Visual; "Film/TV" label; sunglasses/basketball glyphs | Search, filter, A–Z tests passed; scroll and loading on device: device open |
| Directory (contact list) | Visual; A–Z rail, filter, glyph medallion | Locked state visual: paywall replaces list |
| Contact detail | Visual; Call/Email/Website pills equal width at 360 px | Method, favourite and tracker tests passed; native URL handlers: device open |
| Tracker dashboard | Visual; "Edit weekly goals" centred | Activity and goals tests passed; week rollover on device: device open |
| Log activity / log entry | Visual; heading centred; disabled Save readable | Form tests passed; keyboard on device: device open |
| Goals editor | Visual; centred heading and CTA | Goals persistence tests passed |
| Tracker history | Visual; centred heading; section labels left inside centred column | History tests passed; swipe delete on device: device open |
| Challenges / track list | Visual; locked "Premium track" state reviewed | Progress tests passed; live admin edit on device: device open |
| Track detail / challenge detail | Visual; progress ring centred; primary action clear | Stable-ID progress tests passed |
| Inspiration | Visual; featured quote centred; share and save buttons | Save and share tests passed; share image on physical phone: device open |
| Paywall | Visual; preview labelled "Test plan" | Billing bridge tests passed; store purchase belongs to Phase 6 |
| Subscription | Visual; preview states shown | Live entitlement: Phase 6 |
| Profile | Visual; initials avatar, centred title | Name and track tests passed |
| Edit profile | Visual; neutral person placeholder when no name (was a stray "?") | Validation, save and logout: device open |
| Notifications | Visual; toggles readable | Preference persistence test passed; live load: device open |
| Locked states | Visual for category, contact list, challenges and track detail: each shows the centred unlock prompt or "Premium track" | Entitlement is enforced by server rules; device check open |
| Empty and error states | Preview error lines reviewed (no backend in preview) | Live empty/error on device: device open |

## Admin

| Page | Evidence |
|---|---|
| Login | Redesigned to one centred column with logo and `®` lockup; deployed as `dpl_7wi32oihmAv6Njg1j5ATmHUcTDNS`; live CSS confirmed (no DM Sans, no brown overlay) |
| Home | Light theme; verified after sign-in on the deployed site |
| Contacts | Create, edit, deactivate and restore verified on the deployed site (test record `QA-TEST Contact 582406`, left Active for later cleanup) |
| Bulk CSV import | Reported working in an earlier session by the owner |
| Categories | Owner-confirmed working; edits existing categories only, no add or delete |
| Quotes, tracks, track challenges | Owner-confirmed working |

## Source audit

- Aurora layer and its tokens removed. Mobile root and native config are white.
- Category glyphs are chosen by stable slug: sunglasses for Fashion, basketball for Sports. Live database icon values (`diamond-outline`, `trophy-outline`) are kept until a reviewed migration; decision in `docs/icon-options.md`.
- Brand text: every visible full-brand string carries one `®`, enforced by `lightThemeContract.test.ts` (mobile) and `brandContract.test.ts` (admin).
- No people images are rendered. Profile avatars show initials, or a neutral person glyph with no name.
- Automated checks on the final code: mobile typecheck clean, 39 suites / 102 tests passing; admin typecheck clean, 23 tests passing, production build passing.

## Still open

- Device checks (clean install, keyboard and safe area, large font, system dark, reduced motion, native links, first-sign-up track save, share image on a phone): need a physical Android phone or emulator and an iOS device for the iOS-specific items.
- Production-only cleanup: the stray `markhor-proj` Vercel project created by a root-level deploy is still live, and the `QA-TEST` contact should be removed before delivery.
