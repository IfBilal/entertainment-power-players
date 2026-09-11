# Entertainment Power Players

Subscription app for people building a career in entertainment: a contact directory, a weekly activity tracker, career challenge tracks, and an industry quote feed. Full build spec lives in [`docs/Entertainment-Power-Developer-Handbook.md`](docs/Entertainment-Power-Developer-Handbook.md).

**Stack:** React Native / Expo (TypeScript) mobile app · React + Vite admin panel · Firebase (Auth, Firestore, Cloud Functions, Hosting) · RevenueCat.

## Repo layout

```
docs/               Build spec, seed content, CSV import template
apps/mobile/         Expo app (this repo's main deliverable for Week 1)
apps/admin/          React + Vite admin panel (scaffolded, built out in Week 2)
functions/           Firebase Cloud Functions (CSV import, RevenueCat webhook, etc.)
firebase/            firestore.rules, firestore.indexes.json, firebase.json
```

## Status

**Week 1 (Foundations & Design) — complete.** See [`docs/week1-acceptance.md`](docs/week1-acceptance.md) for the full criteria checklist.

**Firebase project is live:** `entertainment-power-play-bcf29`. Firestore rules/indexes deployed, and real data seeded — 5 categories, 5 quotes, 6 challenge tracks (60 challenges), and 3 sample contacts. `apps/mobile/.env` is already filled in with this project's config (gitignored — see "Firebase project setup" below if you need to regenerate it on another machine). Auth (Email/Password, Google) still needs to be switched on once in the console — see below.

## Getting started

### Mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Open in Expo Go (scan the QR code) or an iOS/Android simulator. `.env` is already filled in with the real Firebase project's config (see `.env.example` for the shape, if you need to regenerate it elsewhere). Note: the screens themselves still read from local mock data, not live Firestore — that wiring is Week 2 scope; the real project/data is ready and waiting for it.

### Cloud Functions

```bash
cd functions
npm install
npm test          # unit tests, no Firebase project or emulator required
```

### Firebase project setup

Already done for `entertainment-power-play-bcf29` — this section is for regenerating config on another machine, re-seeding, or standing up a second (e.g. staging) project.

1. `npm install -g firebase-tools` (or use `npx firebase-tools`)
2. `firebase login`
3. `firebase projects:create` (or use an existing project) and note the project id
4. From `firebase/`: `cp .firebaserc.example .firebaserc` and put the project id in it
5. Install a JDK 21 or newer (required by the Firestore emulator/firebase-tools) — `firebase emulators:start` will tell you if one is missing or too old
6. `firebase emulators:start` to run Firestore + rules locally; `functions/` and `firebase/` tests that need the emulator are documented in each folder
7. In the Firebase Console → **Build → Authentication → Get started**, enable **Email/Password** and **Google** sign-in (one click each). Apple sign-in needs your own Apple Developer account.
8. To re-seed categories/quotes/tracks/challenges: from `functions/`, generate a service account key yourself (Project Settings → Service Accounts → Generate new private key — **do this yourself, never share/commit this file**), save it somewhere outside the repo, then:
   ```bash
   cd functions
   npm install
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/your-key.json npm run seed
   ```

### Admin panel

Scaffolded only — see [`apps/admin/README.md`](apps/admin/README.md). Built out in Week 2.
