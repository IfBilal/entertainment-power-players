# Proposed light UI direction — review sheet

This is the implementation starting point for Bilal's **white, contemporary, centered, vibrant/minimal** brief, not a substitute for his review of the five redesigned screens. The old dark PNG/JPEG mockups are not design authority.

## Visual language

- Canvas: pure white `#FFFFFF` through native splash, safe areas, screens, sheets, and bottom navigation. Use a very pale neutral `#F7F9F7` only to separate cards/sections, never as a dark-frame substitute.
- Ink: `#142019` for primary text, `#526258` for secondary text, `#68776D` for tertiary labels. Hairline border `#DCE4DC`. Avoid white text except on a dark-enough CTA or status chip.
- Brand accents: deep green `#216B36` for accessible actions and selected states; logo lime `#90D010` and orange `#F05000` in small graphic details only. On white, lime/orange are not body-text colors because contrast is insufficient.
- Typography: Inter throughout mobile; matching modern sans stack in admin. Hero 34/40 semibold, screen title 28/34 semibold, section 20/26 semibold, body 16/24 regular, caption 13/18 medium, **button 18/24 semibold**. Permit wrapping and large system font scaling.
- Geometry: 20–24 dp equal side gutters on compact phones; page/title/hero/CTA centered as blocks. Long descriptions and list metadata may be left-aligned within the centered content column. Cards use 16–20 dp radius, restrained border or shadow, and 16–24 dp internal padding.
- Tap targets: primary and secondary actions at least 48 dp tall. Distinct pressed, loading, disabled, focus, and error states; reduced-motion setting disables nonessential entrance/stagger motion.
- Category icons: one shared resolver. Fashion = sunglasses, Film/TV = film/camera, Gaming = controller, Music = notes, Sports = basketball. A server icon value must not replace the required sunglasses/basketball pair. Functional control glyphs remain allowed; decorative people/portrait imagery does not.
- Branding: one visual mark close to `ENTERTAINMENT POWER PLAYERS®`; the mark/wordmark group sits lower on splash. Do not overlay an extra `®` on a bitmap that already contains one.

## Five first-review compositions

1. **Splash:** white full-bleed; logo/wordmark as one compact centered group below the vertical midpoint; small accent stroke, short tagline, no streak/aurora. Native and React splash backgrounds match.
2. **Directory:** centered title and search at top; balanced five-category grid with pictograms/counts; spacious white list rows, visible A–Z rail and filter chips; no portrait circles.
3. **Contact detail:** centered category pictogram/name/role block, then legible company/city/details in a narrow centered column; large call/email/site, favorite, and tracker actions; absent fields do not yield dead controls.
4. **Tracker:** centered current-week heading and progress ring with numerals exactly centered; three activity actions large enough to scan; activity history and goals below in light cards.
5. **Challenges:** centered track heading and selected-track state; canonical category icons; high-contrast progress and clear counter/single-completion controls; open/reopen retains server state.

## Verification before visual sign-off

Capture each composition at about 360×800 and 390×844 dp, plus a dark-system-setting pass that still displays the light app. Check a normal and a relevant loading/empty/locked state, both tap and keyboard behavior, status/navigation bars, and at least one large-font pass. Compare against the rubric in the main plan. Bilal's corrections become explicit acceptance items; a code-only review is not visual sign-off.
