import { Easing } from 'react-native';

/**
 * Central animation durations/easings so screens and components stop
 * hardcoding ad hoc numbers (spec §50). Keep durations short — premium reads
 * as restrained motion, not constant movement.
 */
export const motion = {
  fast: 120,
  standard: 220,
  emphasis: 320,
  slow: 600,
} as const;

export const easing = {
  standard: Easing.out(Easing.cubic),
  emphasis: Easing.out(Easing.back(0.9)),
} as const;

export type MotionToken = keyof typeof motion;
