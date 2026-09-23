/**
 * EPP dark theme. Near-black surfaces carrying a green-teal undertone (sampled
 * from the client mockups, docs/ui-*.png) with the brand's lime->orange
 * gradient as the single source of accent. Both accent hues come straight out
 * of the logo (docs/brand-logo-mark.png): lime #90D010 and orange #F05000.
 *
 * Surfaces are deliberately not pure black — #050F11 rather than #000 — so the
 * aurora light-leaks and card borders have something to sit against.
 */
export const colors = {
  // Surfaces — a near-black ramp with a green-teal cast
  background: '#050F11',
  backgroundDeep: '#000A0C',
  surface: '#0B1A17',
  surfaceSubtle: '#091412',
  surfaceStrong: '#12211C',
  surfaceRaised: '#14231E',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.04)',

  // Hairline borders — alpha over the dark ground, never a solid grey
  border: 'rgba(255, 255, 255, 0.08)',
  borderSubtle: 'rgba(255, 255, 255, 0.05)',
  borderStrong: 'rgba(255, 255, 255, 0.14)',

  // Ink — white ramped down by opacity rather than greying toward the bg
  ink: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.68)',
  textTertiary: 'rgba(255, 255, 255, 0.50)',
  textMuted: 'rgba(255, 255, 255, 0.38)',
  textInverse: '#06120E',

  // Accent — the brand gradient's two ends, plus the amber from the star
  accent: '#90D010',
  accentLime: '#90D010',
  accentOrange: '#F05000',
  accentAmber: '#F0A010',
  accentDeep: '#108010',
  accentSoft: 'rgba(144, 208, 16, 0.16)',
  accentFaint: 'rgba(144, 208, 16, 0.08)',
  accentSoftText: '#B6E64A',
  accentOrangeSoft: 'rgba(240, 80, 0, 0.16)',

  // Feedback — tuned for legibility on a dark ground
  success: '#6FD13B',
  successSoft: 'rgba(111, 209, 59, 0.14)',
  danger: '#FF6B5A',
  dangerSoft: 'rgba(255, 107, 90, 0.14)',
  warning: '#F0A010',
  warningSoft: 'rgba(240, 160, 16, 0.14)',
  info: '#5FC8D8',
  infoSoft: 'rgba(95, 200, 216, 0.14)',

  overlay: 'rgba(0, 6, 8, 0.72)',
} as const;

export type ColorToken = keyof typeof colors;
