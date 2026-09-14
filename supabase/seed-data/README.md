# Placeholder contacts dataset

`placeholder-contacts.csv` — 130 fake-but-realistic contacts (26 per category
across Fashion, Film/TV, Gaming, Music, Sports), generated for Week 2
development and testing per the resolved plan decision (real client data
not yet available). Imported into the live project via the
`import-contacts-csv` Edge Function on 2026-09-14 — the same path the admin
panel's Bulk Upload page uses.

Names, companies and contact details are all invented; any resemblance to
real people or companies is coincidental. **Replace this dataset (delete the
imported rows, then re-import a real one through the admin panel) as soon as
the client provides actual contact data** — see decision #3 in
`docs/week2-implementation-plan.md`.

To re-import (or import into a fresh environment): open the admin panel →
Bulk upload → pick this file → columns auto-map → import.
