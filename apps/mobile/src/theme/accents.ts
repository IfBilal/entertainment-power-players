import { colors } from './colors';

/**
 * Category badge colours. Each category gets a bold, solid fill with a white
 * glyph on top -- a characterized emblem, not a soft pastel icon chip -- so
 * the six industries read as distinct badges at a glance. Keyed by stable
 * slug so a database rename of the display name never changes the colour.
 */
export const categoryPalette: Record<string, { fill: string; glyph: string }> = {
  fashion: { fill: '#A94812', glyph: colors.textInverse },
  'film-tv': { fill: '#216B36', glyph: colors.textInverse },
  gaming: { fill: '#337326', glyph: colors.textInverse },
  music: { fill: '#8F5B00', glyph: colors.textInverse },
  sports: { fill: '#196A73', glyph: colors.textInverse },
  'creators-producers': { fill: '#5B3A8F', glyph: colors.textInverse },
};

/** Fallback for a slug outside the six supervisor-approved categories. */
export const neutralCategoryPalette = { fill: colors.textTertiary, glyph: colors.textInverse };

/** Weekly metric colours on the tracker dashboard, one per log type. */
export const metricAccents = {
  contacts: '#FDB90B',
  events: '#72D222',
  followUps: '#FA6100',
} as const;
