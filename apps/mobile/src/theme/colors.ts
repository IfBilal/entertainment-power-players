/** Semantic light palette from the supervisor's white/minimal brief.
 * The logo's bright lime and orange remain artwork accents; text and controls
 * use darker green/orange values that stay readable on white. */
export const colors = {
  background: '#FFFFFF',
  backgroundDeep: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F7F9F7',
  surfaceStrong: '#EDF3ED',
  surfaceRaised: '#FFFFFF',
  surfaceTranslucent: 'rgba(255, 255, 255, 0.88)',

  border: '#DCE4DC',
  borderSubtle: '#EBF0EB',
  borderStrong: '#BECBBE',

  ink: '#142019',
  textPrimary: '#142019',
  textSecondary: '#526258',
  textTertiary: '#68776D',
  textMuted: '#68776D',
  textInverse: '#FFFFFF',

  accent: '#216B36',
  accentLime: '#216B36',
  accentOrange: '#B63E11',
  accentAmber: '#8F5B00',
  accentDeep: '#174E2A',
  accentSoft: 'rgba(33, 107, 54, 0.10)',
  accentFaint: 'rgba(33, 107, 54, 0.06)',
  accentSoftText: '#216B36',
  accentOrangeSoft: 'rgba(182, 62, 17, 0.10)',

  success: '#17753C',
  successSoft: 'rgba(23, 117, 60, 0.10)',
  danger: '#B42318',
  dangerSoft: 'rgba(180, 35, 24, 0.09)',
  warning: '#8F5B00',
  warningSoft: 'rgba(143, 91, 0, 0.10)',
  info: '#196A9A',
  infoSoft: 'rgba(25, 106, 154, 0.10)',

  overlay: 'rgba(20, 32, 25, 0.38)',
} as const;

export type ColorToken = keyof typeof colors;
