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

**Week 1 (Foundations & Design) — in progress.** See [`docs/week1-acceptance.md`](docs/week1-acceptance.md) for the criteria checklist once available.

## Getting started

### Mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Open in Expo Go (scan the QR code) or an iOS/Android simulator. Copy `.env.example` to `.env` and fill in Firebase web config once a Firebase project exists (see below) — the app runs fully on mock/local data without it for Week 1.

### Cloud Functions

```bash
cd functions
npm install
npm test          # unit tests, no Firebase project or emulator required
```

### Firebase project setup (required before Week 2 features go live)

1. `npm install -g firebase-tools` (or use `npx firebase-tools`)
2. `firebase login`
3. `firebase projects:create` (or use an existing project) and note the project id
4. From `firebase/`: `cp .firebaserc.example .firebaserc` and put the project id in it
5. Install a JDK (required by the Firestore emulator) — `firebase emulators:start` will tell you if one is missing
6. `firebase emulators:start` to run Firestore + rules locally; `functions/` and `firebase/` tests that need the emulator are documented in each folder

### Admin panel

Scaffolded only — see [`apps/admin/README.md`](apps/admin/README.md). Built out in Week 2.
