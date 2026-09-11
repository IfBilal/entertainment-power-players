import { Platform } from 'react-native';
import { colors } from './colors';

/**
 * Soft, warm-tinted elevation (ink-tinted shadow, not pure black) — reads as
 * paper lifting off paper rather than a generic Material drop shadow.
 */
function shadow(elevation: number, opacity: number, radius: number, y: number) {
  return Platform.select({
    ios: {
      shadowColor: colors.ink,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
    android: {
      elevation,
    },
    default: {},
  });
}

export const shadows = {
  none: {},
  card: shadow(2, 0.08, 10, 3),
  raised: shadow(6, 0.12, 18, 8),
  floating: shadow(12, 0.16, 28, 14),
} as const;

export type ShadowToken = keyof typeof shadows;
