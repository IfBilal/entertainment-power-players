# Entertainment Power Players

Subscription app for people building a career in entertainment: a contact directory, a weekly activity tracker, career challenge tracks, and an industry quote feed. Full build spec lives in [`docs/Entertainment-Power-Developer-Handbook.md`](docs/Entertainment-Power-Developer-Handbook.md) — note the handbook itself describes a Firebase backend; the project switched to Supabase after Week 1 (see [`docs/week1-acceptance.md`](docs/week1-acceptance.md) for why), so treat Supabase as the source of truth for backend architecture and the handbook as the source of truth for product/screen behavior.

**Stack:** React Native / Expo (TypeScript) mobile app · React + Vite admin panel · Supabase (Auth, Postgres, Edge Functions) · RevenueCat.

## Repo layout

```
docs/               Build spec, seed content, CSV import template
apps/mobile/        Expo app (this repo's main deliverable for Week 1)
apps/admin/         React + Vite admin panel (scaffolded, built out in Week 2)
supabase/
  migrations/       Postgres schema + RLS policies
  seed.sql          Real seed content (categories, quotes, tracks/challenges, sample contacts)
  functions/
    import-contacts-csv/   CSV import Edge Function
```

## Status

**Week 1 (Foundations & Design) — complete.** See [`docs/week1-acceptance.md`](docs/week1-acceptance.md) for the full criteria checklist.

**Supabase project is live:** `entertainment-power-players` (ref `knrjhmrsuyzzxlverryl`). Schema + RLS policies deployed (12 tables, all RLS-enabled, security/performance advisories clean), real data seeded (5 categories, 5 quotes, 6 tracks × 10 challenges, 3 sample contacts), Auth enabled (Email/Password + Google), and the `import-contacts-csv` Edge Function deployed and verified end-to-end (admin-only, tested against the real sample CSV). `apps/mobile/.env` is already filled in with this project's config (gitignored).

## Getting started

### Mobile app

```bash
cd apps/mobile
npm install
npx expo start
```

Open in Expo Go (scan the QR code) or an iOS/Android simulator. `.env` is already filled in with the real Supabase project's config (see `.env.example` for the shape, if you need to regenerate it elsewhere). Note: the screens themselves still read from local mock data, not live Postgres — that wiring is Week 2 scope; the real project/data is ready and waiting for it.

### Supabase project

Already set up for `entertainment-power-players`. This section is for local development, re-seeding, or standing up a second (e.g. staging) project.

1. `supabase login` (opens a browser)
2. `supabase link --project-ref knrjhmrsuyzzxlverryl` (or `supabase projects create` for a new one)
3. Local Postgres via Docker: `supabase db start`, then `supabase migration up --local` to apply `supabase/migrations/*.sql`
4. Load seed data locally: `PGPASSWORD=postgres psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f supabase/seed.sql` (the Supabase CLI's own `db query -f` doesn't support multi-statement files — use `psql` directly, or the Supabase dashboard's SQL editor for the real project)
5. Edge Functions: `deno test --allow-read` from `supabase/functions/import-contacts-csv/` to run its unit tests; `supabase functions deploy import-contacts-csv` to deploy
6. In the Supabase dashboard → **Authentication → Providers**, enable **Email** and **Google** (already done for the live project). Apple sign-in needs your own Apple Developer account.

### Admin panel

Scaffolded only — see [`apps/admin/README.md`](apps/admin/README.md). Built out in Week 2.
