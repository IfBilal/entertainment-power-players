import { Platform } from 'react-native';

/**
 * On a near-black ground the old warm, ink-tinted elevation was invisible.
 * Depth here comes from pure-black shadows at higher opacity, paired with the
 * hairline `colors.border` on the card itself — the border does most of the
 * separating work, the shadow just grounds the element.
 */
function shadow(elevation: number, opacity: number, radius: number, y: number) {
  return Platform.select({
    ios: {
      shadowColor: '#000000',
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
  card: shadow(3, 0.35, 12, 4),
  raised: shadow(8, 0.45, 20, 8),
  floating: shadow(16, 0.55, 32, 14),
} as const;

export type ShadowToken = keyof typeof shadows;
