# Visual design system

The handbook (§4.8) specified only: "Clean, bright, minimalist. Plenty of white space, clear type, no clutter, one accent colour used consistently." No palette, typeface, or reference app was given — the first pass (`apps/mobile` as originally built) filled that gap with a generic indigo accent on the system font and no motion, which read as a template rather than a designed product. This is the follow-up design pass, direction chosen by the user: **warm editorial**.

## Palette (`src/theme/colors.ts`)

Cream paper background, warm near-black ink, one confident terracotta accent — chosen specifically to avoid the default purple/indigo "AI app" look.

| Token | Value | Use |
|---|---|---|
| `background` | `#FBF7F0` | Screen background |
| `surface` | `#F3ECDD` | Recessed fills (track behind progress bars, chart card) |
| `surfaceRaised` | `#FFFFFF` | Cards, inputs |
| `ink` / `textPrimary` | `#221B14` | Primary text |
| `textSecondary` | `#6F6252` | Secondary text |
| `accent` | `#B0501C` | The one accent colour — buttons, active states, progress fills |
| `accentSoft` | `#F1DCC5` | Accent tint backgrounds (badges, selected chips, icon wells) |

`accentDeep` and `accentSoft` are tints/shades derived from the single accent for state variation (pressed, selected, badge), not a second competing colour — still "one accent colour used consistently" in spirit.

## Typography (`src/theme/typography.ts`, `src/theme/fonts.ts`)

- **Fraunces** (a warm, high-contrast editorial serif) for `display`/`title`/`subtitle` — headlines, screen titles, the wordmark.
- **Inter** (a clean, highly legible grotesk) for `body`/`caption`/`label`/`button` — everything read as running text or UI chrome.

Loaded via `@expo-google-fonts/fraunces` and `@expo-google-fonts/inter` (real font files bundled with the app, not the OS system font). `App.tsx` holds the splash screen until fonts are loaded (`expo-splash-screen`) so there's no flash of system-font text.

## Elevation (`src/theme/shadows.ts`)

Soft, ink-tinted shadows (not pure black, not Material's default grey) — `card`, `raised`, `floating` tokens, applied via the `Card` primitive's `elevation` prop.

## Motion

All done with React Native's built-in `Animated` API — no Reanimated/Skia, so no extra native or babel config, and it works unmodified in Expo Go:

- **Screens** fade + rise in on mount (`Screen` component, `animateIn` prop).
- **Buttons** scale down on press plus a light haptic tick (`expo-haptics`); destructive actions get a medium tick.
- **Progress bars and rings** animate their fill from 0 to the current value instead of snapping (`ProgressBar`, `ProgressRing`).
- **The 8-week bar chart** grows its bars in on mount.
- **Paywall** presents as a bottom-sheet modal (`presentation: 'modal'`, `animation: 'slide_from_bottom'`) rather than a plain pushed screen.

## What's still open

- Icon defaults in `docs/icon-options.md` are unchanged by this pass — still pending your sign-off.
- No dark mode — `app.json` is `userInterfaceStyle: light` intentionally, matching a single deliberate palette rather than spreading effort across two.
- Haptics and the `Animated`-driven motion above are exactly what's testable in Expo Go; a physical device is the only way to actually feel them — I can't verify that part myself.
