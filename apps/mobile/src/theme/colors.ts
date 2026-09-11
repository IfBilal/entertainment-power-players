/**
 * One accent colour used consistently, per handbook §4.8 (clean, bright, minimalist).
 */
export const colors = {
  accent: '#5B5BF0',
  background: '#FFFFFF',
  surface: '#F7F7FB',
  border: '#E7E7EF',
  textPrimary: '#15151F',
  textSecondary: '#6B6B7A',
  textInverse: '#FFFFFF',
  success: '#1FA971',
  danger: '#E5484D',
  warning: '#F5A524',
  overlay: 'rgba(21, 21, 31, 0.5)',
} as const;

export type ColorToken = keyof typeof colors;
