# Week 1 acceptance — Foundations & Design

Status against handbook §6 Week 1 and the "Done when" line. Updated as of this build.

## Handbook §6 Week 1 checklist

| Item | Status | Evidence |
|---|---|---|
| Firebase project, Firestore structure, security rules written | ✅ Done | `firebase/firestore.rules`, `firebase/firestore.indexes.json` |
| ...passing emulator tests | ⏸️ Pending your action | `firebase/tests/firestore.rules.test.ts` written (17 assertions across 6 describe blocks) but **not run** — no JDK on this machine. Run `cd firebase && npm test` after installing a JDK. |
| Repo, TypeScript config, navigation skeleton, theme tokens, shared component primitives | ✅ Done | `apps/mobile/tsconfig.json` (strict), `apps/mobile/src/theme/`, `apps/mobile/src/components/`, `apps/mobile/src/navigation/` |
| CSV import function written and run against a sample of the real data | ✅ Done (unit-level) / ⏸️ Pending emulator | `functions/src/csvImport.ts` + `functions/src/index.ts` (`importContactsCsv` callable). Unit tests run it against the real `docs/contacts-import-template.csv` (`functions/src/csvImport.test.ts`) and pass. **Not yet run against a live Firestore emulator/project** — that requires your Firebase project + JDK. |
| Every column in the source data mapped to a field, any unmapped column reported | ✅ Done | `KNOWN_COLUMNS` in `functions/src/csvImport.ts`; `unmappedColumns` in the report; tested in `csvImport.test.ts` |
| Full screen designs for all five tabs, plus onboarding and paywall | ✅ Done | All screens in `apps/mobile/src/features/**`, built as real running Expo screens (not Figma — confirmed with you), covering every screen listed in handbook §4 |
| Icon set options prepared for category selection | ✅ Done | `apps/mobile/src/theme/icons.ts`, written up in `docs/icon-options.md` — **pending your 5-minute sign-off on the defaults** |

## "Done when" line

> designs cover every screen in section 4, and the import script loads sample data into staging with rules enforced

- **Designs cover every screen in §4**: ✅ verified by inventory — onboarding (splash, 3 intro slides, sign up, login, forgot password, track picker), Directory (category grid, contact list w/ search+filter+A–Z jump bar, contact detail, favourites, mark-as-contacted), Tracker (dashboard, log entry, goals editor, 8-week chart, history), Challenges (track list, track detail with single/counter challenges + notes), Inspiration (quote feed + quote of the day + share/save UI), Profile, Paywall. All reachable via navigation, exercised by the `mainTabNavigator.test.tsx` and `onboardingNavigator.test.tsx` tests.
- **Import script loads sample data into staging with rules enforced**: ⏸️ **Pending your action.** The import function is written and unit-tested against the real sample CSV, and the rules are written and unit-tested (assertions), but actually running either against a live Firestore emulator or a real "staging" project requires a JDK (emulator) and a Firebase project (staging). See "What you need to do" below.

## What you need to do

1. **Install a JDK** (any recent LTS, e.g. via your OS package manager or `sdk install java`) — required for the Firestore emulator.
2. **Create/select a Firebase project**: `firebase login`, then `firebase projects:create` (or reuse an existing one). Copy `firebase/.firebaserc.example` to `firebase/.firebaserc` and put the project id in it.
3. Run `cd firebase && npm test` — this spins up the Firestore emulator and runs `firebase/tests/firestore.rules.test.ts` (17 assertions: contacts pro-gating, categories/tracks/quotes/config free-for-signed-in, challenges subcollection pro-gating, users/{uid} isolation, admin-only collections).
4. Run `cd functions && npm run build` then, with the emulator running, exercise `importContactsCsv` against `docs/contacts-import-template.csv` to confirm end-to-end writes land and are rules-enforced (a Firestore emulator UI walkthrough or a small script calling the callable — happy to write that script once the emulator is confirmed working on your machine).
5. **Sign off on the icon defaults** in `docs/icon-options.md` (or tell me which alternates to swap in).
6. Run `cd apps/mobile && npx expo start` and open it in Expo Go / a simulator to eyeball all 5 tabs + onboarding + paywall — I can't render a mobile simulator from here.

## Known substitutions from the handbook's literal library list

- **Charts**: handbook §2 names Victory Native. Built instead as a small custom flexbox `BarChart` component (`apps/mobile/src/components/BarChart.tsx`). Victory Native's current major version pulls in `@shopify/react-native-skia` + `react-native-reanimated` + `react-native-gesture-handler`, which need careful babel/native config to get right — not worth the fragility for a static 8-week trend bar chart in Week 1 with no device to test on. Swapping in Victory Native later is a contained change (one component).
- Everything else in the handbook's library table (React Navigation, Zustand, TanStack Query, React Hook Form + Zod, FlashList/SectionList, PapaParse) is used as specified.

## Test summary

- `apps/mobile`: `npx tsc --noEmit` clean; `npm test` → 34 tests passing across 9 suites (pure logic: nameLower/sortKey, week-key ISO rollover incl. year boundary, quote-of-the-day determinism, paywall gating, challenge single/counter state machine, contact search/filter/grouping; component smoke tests; navigation reachability tests for all 5 tabs + onboarding).
- `functions`: unit tests for CSV parsing/validation/column-mapping against the real sample CSV, and for the shared `nameLower`/`sortKey` derivation — passing without needing the emulator.
- `firebase`: rules tests written, **not yet run** (needs your JDK + emulator, see above).
