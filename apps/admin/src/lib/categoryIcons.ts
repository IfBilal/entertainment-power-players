/** Supervisor-approved, slug-bound icons. Stored legacy icon names cannot override these. */
export const CATEGORY_ICON_BY_SLUG = {
  fashion: 'sunglasses',
  'film-tv': 'film-outline',
  gaming: 'game-controller-outline',
  music: 'musical-notes-outline',
  sports: 'basketball-outline',
} as const;

export type CategoryIcon = (typeof CATEGORY_ICON_BY_SLUG)[keyof typeof CATEGORY_ICON_BY_SLUG] | 'shapes-outline';

export function canonicalCategoryIcon(slug: string): CategoryIcon {
  return CATEGORY_ICON_BY_SLUG[slug as keyof typeof CATEGORY_ICON_BY_SLUG] ?? 'shapes-outline';
}
