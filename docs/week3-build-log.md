# Week 3 build log

Week 3's scope and gates are in [the implementation plan](week3-implementation-plan.md). This log distinguishes verified work from work that still needs a device, store or production credential. It is not a Week 3 completion claim.

## Phase 0 — baseline and contracts (2026-09-29)

- Branch: `main`, initially at `4216851`; unrelated untracked `.agents/`, `.aider-desk/`, `.claude/`, `data/`, and `skills-lock.json` left untouched.
- Mobile baseline: `npm test -- --runInBand` — **30 suites / 78 tests passed**; `npm run typecheck` — **passed**. Jest emits existing React `act(...)` warnings but exits 0.
- Admin baseline: `npm test` — **1 file / 19 tests passed**; `npm run typecheck` and `npm run build` — **passed**. Build reports a non-failing >500 kB chunk warning.
- Local SQL preview-entitlement test: `docker exec -i supabase_db_markhor-proj psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/tests/preview_entitlement.sql` — **passed**, transaction rolled back.
- Supabase CLI: 2.105.0. Read CLI help and current changelog. Recent PostgreSQL minor-release warning is not directly implicated by these planned tables; check extension use before any upgrade. Local project is imperative migrations (`schema_paths=[]`).
- EPP project ref, from both ignored mobile/admin `.env` URLs: `knrjhmrsuyzzxlverryl`. This CLI session is **not linked** to it; `supabase projects list` currently enumerates only unrelated projects, so remote EPP migration history and writes are not verified. No remote change is authorized by inference from another project.
- Local migration history has `20260927155855` applied, while repo holds the preview-entitlement migration as `20260927183818`; the local schema already has its columns/function. Treat this as a migration-history mismatch until reconciled; do not apply the same change twice or blindly repair history. No Week 3 migration has been applied yet.
- Native app identifiers in `apps/mobile/app.json`: Android package and iOS bundle ID are both `com.entertainmentpowerplayers.app`. Their external store/RevenueCat registrations, products, prices, trials, testers and iOS signing are **unverified**. `.env` defines RevenueCat public-key slots, but does not prove configured products.
- The stable Week 3 app-side data contracts/query keys are in `apps/mobile/src/types/week3.ts`. Challenge `id` is identity, `order` is presentation; activity's persisted `weekKey` is canonical for history.

### Requirement-to-test map

| Requirement | Automated gate | Real-world gate |
|---|---|---|
| Stable progress after challenge reorder; atomic activity write-through | SQL migration/RLS/transition tests and mobile action tests | Admin edit with detail open, relaunch and inspect tracker history |
| Three tracker log types, goals, eight-week chart and swipe history | Unit/component tests for date/week, count, save/delete, zero goals | Device log/relaunch/delete at week boundary |
| Live admin content | Admin CRUD tests and mobile query tests | Edit open challenge/quote screen from deployed admin |
| Quote-of-day, saved quotes, image share | Deterministic date and favorites isolation tests | Two-device sync and image share sheet on Android/iOS |
| Monthly/annual purchase, restore, expiration, RLS | SDK mock tests, webhook event/replay tests and SQL RLS tests | Separate Google Play and Apple platform-sandbox transactions, second-device restore, expiry |

Phase 0 can close after the new contract typecheck and baseline recheck. Phase 1 must start with the migration-history mismatch resolved locally and confirmed for the EPP remote project before any remote database change.
