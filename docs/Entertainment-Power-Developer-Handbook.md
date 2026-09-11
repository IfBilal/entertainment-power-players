# Entertainment Power Players — Developer Handbook

Build specification for the mobile app, the admin panel and the backend. This document says what to build and how it should behave. Anything not described here is out of scope for version one.

**Stack:** React Native (TypeScript), Firebase, RevenueCat, React admin panel.
**Targets:** iOS 15+, Android 8+, portrait only, phone layouts.

---

## 1. What the product is

A subscription app for people building a career in entertainment. Four pillars:

1. **Directory** — an alphabetised contact directory across five categories: Fashion, Film/TV, Gaming, Music, Sports.
2. **Tracker** — a weekly log of contacts made, events attended and follow-ups, with goals and a trend chart.
3. **Challenges** — six tracks of set career actions the user works through and ticks off.
4. **Inspiration** — a feed of industry quotes.

Directory records and challenges are behind a paid subscription. Category names, track names and quotes are visible to free users.

Every piece of content in the app is editable from the admin panel at runtime. Nothing in the four pillars is hardcoded in the app bundle: no contact, no quote, no challenge, no track, no category icon. Assume the content changes daily.

---

## 2. Architecture

One Firebase project holds everything.

| Piece | Detail |
|---|---|
| Mobile app | React Native, Expo-managed unless a native module forces a bare workflow |
| Auth | Firebase Auth: email/password, Sign in with Apple, Sign in with Google |
| Database | Firestore, with offline persistence enabled |
| Functions | Cloud Functions for the RevenueCat webhook, CSV import and account deletion |
| Admin panel | React + Vite, deployed to Firebase Hosting |
| Subscriptions | RevenueCat, connected to Apple and Google billing |

Entitlement is never decided by the client app. RevenueCat posts to a Cloud Function, the function sets a `pro` custom claim on the user, and Firestore security rules read that claim. The app reads the claim to decide what to render, but the lock lives in the rules.

### Libraries

| Concern | Choice |
|---|---|
| Navigation | React Navigation, bottom tabs plus native stack |
| Server state | TanStack Query over the Firestore SDK |
| Local state | Zustand, one store per feature |
| Forms | React Hook Form with Zod schemas |
| Lists | FlashList, SectionList for the A–Z directory |
| Charts | Victory Native for the 8-week bar chart |
| CSV | PapaParse in the admin panel |

---

## 3. Data model (Firestore)

```
config/app                      minVersion, paywallCopy, freeTierRules
categories/{categoryId}         name, slug, icon, order
contacts/{contactId}            name, nameLower, sortKey, categoryId, role,
                                company, email, phone, website, city, notes,
                                active, updatedAt
quotes/{quoteId}                text, author, active, order
tracks/{trackId}                name, slug, order, active
tracks/{trackId}/challenges/{id}
                                title, description, order, type, target, active
users/{uid}                     displayName, photoURL, selectedTracks[],
                                notificationPrefs, createdAt
users/{uid}/favorites/{contactId}
                                addedAt
users/{uid}/challengeProgress/{challengeId}
                                trackId, status, count, completedAt, note
users/{uid}/activity/{activityId}
                                type, title, contactId, date, weekKey, notes
users/{uid}/goals/{weekKey}     contacts, events, followUps
admins/{uid}                    email, addedBy, addedAt
```

Rules of the model:

- `challenge.type` is `single` or `counter`. A `counter` challenge carries a `target` — "Attend 5 Events" is target 5, "Find 3 Power Players" is target 3. There are no other types.
- `weekKey` is the ISO week in the user's own timezone, format `2026-W37`, written at creation time. Never derive weeks by querying date ranges.
- `nameLower` and `sortKey` are written by the admin panel and the import function, never by the app. `sortKey` strips leading articles and punctuation so the A–Z jump bar sorts correctly.
- Completing a challenge writes two documents: the progress document and an `activity` entry of type `challenge`. That write-through is what puts challenges into the tracker history.
- Deletes are soft. Set `active: false`. Nothing is removed from Firestore except a user deleting their own account.

### Security rules

- `contacts`, `tracks/*/challenges`: read only when `request.auth.token.pro == true`.
- `categories`, `tracks`, `quotes`, `config`: read by any signed-in user.
- `users/{uid}/**`: read and write by that uid only.
- All admin-owned collections: write only when `request.auth.token.admin == true`.

Rules are written and tested against the Firebase emulator in week one, not at the end.

---

## 4. Screen specification

Five bottom tabs: **Directory, Tracker, Challenges, Inspiration, Profile.**

### 4.1 Onboarding

- Splash with the app logo.
- Three intro slides explaining directory, tracker and challenges. Skippable, shown once.
- Sign up and log in with email and password. Sign in with Apple and Sign in with Google. Apple sign-in is mandatory because other providers are present.
- Forgot password by email link.
- Track picker after first sign-up: the user chooses one or more of the six challenge tracks. Saved to `selectedTracks`, changeable later in Profile.

### 4.2 Directory

- Category grid showing the five categories with their admin-set icons. Contact counts per category.
- Contact list inside a category: alphabetical, sticky letter headers, A–Z jump bar down the right edge that scrolls to the section.
- Search across all categories by name, company or role. Debounced 300 ms. Query `nameLower` with a prefix match, plus company and role. If the dataset is under roughly 5,000 records, load once and filter in memory; above that, query Firestore and add the composite indexes.
- Filter sheet inside a category: role and city, built from the values actually present in the data.
- Contact detail: full record, tap to call, tap to email, tap to open website. Any field that is empty is hidden entirely, not shown as a blank row.
- Favourite toggle on both the list row and the detail screen.
- "Mark as contacted" on the detail screen writes an `activity` entry of type `contact` linked to that contact.
- Free users see the category grid and the contact count, then the paywall in place of the list.

### 4.3 Tracker

- Weekly dashboard for the current `weekKey`: counts of contacts, events and follow-ups, each with a progress bar against its goal.
- Log sheet for each type. A contact entry can link to a directory record or be typed manually. An event entry takes name, date and optional notes.
- Goals editor: one number per activity type per week. Carried forward to the next week unless changed.
- Bar chart of the last 8 weeks, one bar per week, total activity per week.
- History list of every entry, newest first, grouped by week, with delete on swipe.

### 4.4 Challenges

- Track list showing the six tracks, with the user's selected tracks pinned to the top. Each row shows completed out of total.
- Track detail: a progress ring at the top, then the challenges in admin-set order.
- A `single` challenge renders a tick box. Tapping it sets `status: complete` and stamps `completedAt`. Tapping again reverts it and removes the linked activity entry.
- A `counter` challenge renders a stepper showing "2 of 5". Increment writes `count`. It completes automatically when `count` reaches `target` and stops there. Decrement is allowed.
- Optional note per challenge, one short free-text field.
- Every completion writes an `activity` entry so it appears in the tracker history and counts toward that week's totals.
- The challenge list is read live. If the content team edits a challenge while a user is on the screen, the new wording appears without an app update; existing progress documents keep their ids and stay attached.

### 4.5 Inspiration

- Quote feed: quote text and author, scrollable.
- Quote of the day pinned at the top, chosen deterministically from the active quotes by date so every user sees the same one and it changes at local midnight.
- Share as an image: render the quote onto a branded card and open the native share sheet.
- Save to favourites.
- Available to free users.

### 4.6 Subscription

- Paywall shown after sign-up and whenever a locked screen is reached. Lists the plan benefits, monthly and annual options, and the trial if one is configured.
- Restore purchases button, required by Apple.
- Subscription status, renewal date and cancellation instructions inside Profile.
- Entitlement changes take effect on the next app launch at the latest; refresh the claim on foreground.

### 4.7 Profile

Edit name and photo, manage subscription, change selected tracks, notification preferences, privacy policy and terms links, contact support, delete account. Delete account removes the user document and all subcollections through a Cloud Function, then signs out.

### 4.8 Design

Clean, bright, minimalist. Plenty of white space, clear type, no clutter, one accent colour used consistently. A generic icon per category rather than photographs — sunglasses for Fashion, a controller for Gaming, and so on. Contacts never carry a photo.

---

## 5. Admin panel specification

A browser panel for content management only. No reporting, no analytics, no subscriber numbers — those are read in RevenueCat.

- Login with email and password. Access requires the `admin` claim; anyone else is bounced to a plain "no access" screen.
- **Contacts:** searchable table, create, edit, soft delete, restore. The form writes `nameLower` and `sortKey` automatically.
- **Bulk upload:** CSV upload with a column-mapping step, a preview of the first ten rows, per-row validation and an error report naming the row numbers that failed. Valid rows import even if others fail. Write in batches of 500.
- **Categories:** name, order and icon selection from the bundled icon set.
- **Quotes:** create, edit, reorder, deactivate.
- **Tracks and challenges:** create, edit, reorder, deactivate. Challenge form includes type (`single` or `counter`) and, for counters, the target number.
- Changes appear in the app immediately, with no app update and no store review.

---

## 6. Weekly build targets

Four weeks. Each week ends on a build or artefact that can be reviewed.

### Week 1 — Foundations and design

- Firebase project, Firestore structure, security rules written and passing emulator tests.
- Repo, TypeScript config, navigation skeleton, theme tokens, shared component primitives.
- CSV import function written and run against a sample of the real data. Every column in the source data mapped to a field, and any unmapped column reported.
- Full screen designs for all five tabs, plus onboarding and paywall.
- Icon set options prepared for category selection.

Done when: designs cover every screen in section 4, and the import script loads sample data into staging with rules enforced.

### Week 2 — Auth, directory, admin panel

- Auth complete: email/password, Apple, Google, forgot password, log out, delete account.
- Directory complete: category grid, A–Z list with jump bar, search, filters, detail screen, tap actions, favourites, mark as contacted.
- Admin panel: login and claim check, contacts CRUD, CSV bulk upload with error reporting, categories and icons.
- Full dataset imported to staging. Composite indexes created for search and filter queries.

Done when: the real directory is browsable on a device, and someone non-technical can add a contact through the panel and see it in the app without a restart.

### Week 3 — Tracker, challenges, inspiration, subscriptions

- Tracker complete: dashboard, all three log types, goals, progress bars, 8-week chart, history.
- Challenges complete: track picker, track detail, progress ring, both challenge types, notes, activity write-through.
- Inspiration complete: feed, quote of the day, share card, saved quotes.
- Admin panel: quotes, tracks and challenges CRUD.
- RevenueCat: products configured, paywall, monthly and annual, trial if configured, restore purchases, webhook function, `pro` claim, gated rules verified.
- Sandbox purchase tested end to end on both platforms.

Done when: a fresh account can sign up, hit the paywall, subscribe in sandbox and reach every gated screen.

### Week 4 — Hardening and submission

- Full QA pass on section 7, across at least two iOS devices and two Android devices.
- Empty states, error states, offline behaviour, slow network handling.
- App icon, splash, store screenshots, listing copy, privacy policy and terms in place.
- Release builds signed and submitted to both stores. Review feedback actioned the same day it arrives.
- Handover: source code, Firebase and RevenueCat ownership transfer, written admin guide.

Done when: both builds are submitted by day three of the week, leaving room for store review inside the four weeks.

---

## 7. QA checklist

Run the whole list before submitting, not during.

- Sign up, log in, log out, forgot password, delete account, on both platforms.
- Sign in with Apple on a physical device, not only the simulator.
- Search with no results, names with accents and punctuation, a category with one contact, a contact missing email or phone.
- Tap to call, email and website each behave correctly when the field is empty.
- Week rollover: an entry logged just before and just after local midnight on the week boundary lands in the correct `weekKey`.
- A goal set to zero, and a week with no activity at all.
- Counter challenge stops at target. Untick removes the matching activity entry. A challenge edited in the panel mid-session updates in place without losing progress.
- Paywall: subscribe, cancel, restore on a second device, expired subscription loses access.
- Admin: a CSV with a malformed row, a CSV with 2,000 rows, an edit appearing in the app without a restart.
- Offline: open the app with no connection after previously browsing, and confirm cached content renders.
- Delete account clears the user's data and signs them out.

---

## 8. Engineering conventions

- TypeScript strict. No `any` in a merged pull request.
- Folders by feature: `src/features/directory/`, `src/features/challenges/`. Shared UI in `src/components/`, all Firebase access behind `src/services/`.
- Branches named `feat/directory-search`, `fix/paywall-restore`. Pull requests into `develop`; `develop` into `main` only for a release.
- Every pull request carries a screenshot or screen recording and a self-test note, and is reviewed before merge.
- No keys or secrets in the repo. Local `.env` only.
- Firebase emulator for all local work. Nobody develops against live data.
- No new dependency without approval.
