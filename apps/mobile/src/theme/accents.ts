import { colors } from './colors';

/**
 * Category pictogram colours. Each category gets a pale fill and a deeper
 * glyph colour, both readable on the white canvas. Keyed by stable slug so a
 * database rename of the display name never changes the colour.
 */
export const categoryPalette: Record<string, { fill: string; glyph: string }> = {
  fashion: { fill: '#FFF2E8', glyph: '#A94812' },
  'film-tv': { fill: '#EAF5EE', glyph: '#216B36' },
  gaming: { fill: '#EEF6E9', glyph: '#337326' },
  music: { fill: '#FFF6E6', glyph: '#8F5B00' },
  sports: { fill: '#E8F4F4', glyph: '#196A73' },
};

/** Fallback for a slug outside the five supervisor-approved categories. */
export const neutralCategoryPalette = { fill: colors.surfaceStrong, glyph: colors.textSecondary };

/** Weekly metric colours on the tracker dashboard, one per log type. */
export const metricAccents = {
  contacts: '#FDB90B',
  events: '#72D222',
  followUps: '#FA6100',
} as const;
