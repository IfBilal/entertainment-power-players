# Category icon specification (supervisor brief, 3 October)

The supervisor's later direction supersedes the older Week 1 option grid. Category icons are fixed by stable slug; an admin cannot substitute apparel, trophy, football, portraits, or unrelated glyphs. The existing database `icon` column is legacy metadata and does not control the visible glyph in the app or admin UI.

| Stable slug | Visible label | Approved pictogram |
|---|---|---|
| `fashion` | Fashion | Sunglasses |
| `film-tv` | Film/TV | Film strip/camera |
| `gaming` | Gaming | Game controller |
| `music` | Music | Musical notes |
| `sports` | Sports | Basketball |

The mobile resolver is `CategoryGlyph`; admin uses `canonicalCategoryIcon(slug)` and matching local SVG paths. Unknown slugs display a neutral shapes icon and receive an admin warning. No new bitmap or third-party icon asset is required. This mapping preserves stable slugs and avoids changing live category rows during the UI migration. A later data-cleanup migration may normalize legacy `icon` values once all consumers have been audited, but the UI must not rely on it.
