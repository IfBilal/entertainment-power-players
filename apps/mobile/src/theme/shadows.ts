import { Platform } from 'react-native';

/** Restrained elevation; light cards rely primarily on their border. */
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
  card: shadow(2, 0.07, 10, 3),
  raised: shadow(5, 0.11, 18, 6),
  floating: shadow(10, 0.15, 28, 10),
} as const;

export type ShadowToken = keyof typeof shadows;
