# Category icon options (Week 1)

Prepared per the handbook (§1: "no category icon hardcoded"; §5: "icon selection from the bundled icon set"). These are Ionicons (bundled with Expo via `@expo/vector-icons`, no extra asset pipeline needed) so the admin panel can offer a picker without shipping custom art. Defined in `apps/mobile/src/theme/icons.ts`.

| Category | Default | Alternates | Rationale |
|---|---|---|---|
| Fashion | `glasses-outline` (sunglasses) | `shirt-outline`, `diamond-outline` | Sunglasses is the handbook's own example (§4.8) |
| Film/TV | `film-outline` | `videocam-outline`, `tv-outline` | Film reel reads instantly as the category |
| Gaming | `game-controller-outline` | `headset-outline`, `planet-outline` | Controller is the handbook's own example (§4.8) |
| Music | `musical-notes-outline` | `mic-outline`, `headset-outline` | Universally recognizable |
| Sports | `trophy-outline` | `american-football-outline`, `basketball-outline` | Trophy is sport-agnostic; ball icons are code-specific alternates |

All icons are line/outline style to match the "clean, bright, minimalist" direction (§4.8) and render at a single accent colour (`colors.accent`) or neutral grey depending on selected/unselected state.

**Pending your sign-off:** confirm the "default" column, or pick an alternate — this is a five-minute decision, not a blocker for the rest of Week 1. If you want different icons entirely, any name from the [Ionicons set](https://icons.expo.fyi) works as a drop-in replacement in `icons.ts`.
