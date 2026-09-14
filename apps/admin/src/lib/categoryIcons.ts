/**
 * The bundled icon set the category picker chooses from (handbook §5:
 * "icon selection from the bundled icon set"). These are Ionicons names,
 * matching apps/mobile/src/theme/icons.ts — the mobile app renders whatever
 * name is stored on the category row, so this list must stay a subset of
 * what @expo/vector-icons ships. See docs/icon-options.md.
 */
export const CATEGORY_ICON_OPTIONS = [
  'glasses-outline',
  'shirt-outline',
  'diamond-outline',
  'film-outline',
  'videocam-outline',
  'tv-outline',
  'game-controller-outline',
  'headset-outline',
  'planet-outline',
  'musical-notes-outline',
  'mic-outline',
  'trophy-outline',
  'american-football-outline',
  'basketball-outline',
  'people-outline',
  'briefcase-outline',
  'star-outline',
  'sparkles-outline',
] as const;

export type CategoryIcon = (typeof CATEGORY_ICON_OPTIONS)[number];
