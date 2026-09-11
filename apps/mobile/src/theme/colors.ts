/**
 * Warm editorial palette: cream paper background, warm near-black ink, one
 * confident terracotta accent — deliberately not the default-indigo "AI app"
 * look. One accent colour used consistently, per handbook §4.8.
 */
export const colors = {
  // Surfaces
  background: '#FBF7F0',
  surface: '#F3ECDD',
  surfaceRaised: '#FFFFFF',
  border: '#E6DAC3',
  borderStrong: '#D8C7A5',

  // Ink
  ink: '#221B14',
  textPrimary: '#221B14',
  textSecondary: '#6F6252',
  textMuted: '#9C8F7B',
  textInverse: '#FBF7F0',

  // Accent — burnt terracotta
  accent: '#B0501C',
  accentDeep: '#8A3D14',
  accentSoft: '#F1DCC5',
  accentSoftText: '#7A3611',

  // Feedback
  success: '#3E7A4C',
  successSoft: '#E1EFE1',
  danger: '#A5342A',
  dangerSoft: '#F4DFDA',
  warning: '#B08120',

  overlay: 'rgba(34, 27, 20, 0.55)',
} as const;

export type ColorToken = keyof typeof colors;
