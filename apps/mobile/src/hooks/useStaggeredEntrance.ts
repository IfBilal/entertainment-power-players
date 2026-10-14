import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

/**
 * Fade + rise entrance for one item in a list/grid, delayed by its index so
 * a row of cards cascades in rather than popping in all at once. Shared by
 * CategoryCard, QuoteCard, and any other list-like entrance (spec §entrance
 * stagger) so the delay curve and easing stay consistent everywhere.
 */
export function useStaggeredEntrance(index = 0, options?: { maxDelay?: number; distance?: number }) {
  const maxDelaySteps = options?.maxDelay ?? 5;
  const distance = options?.distance ?? 22;
  const reduceMotion = useReducedMotion();
  const skip = reduceMotion || process.env.NODE_ENV === 'test';

  const opacity = useRef(new Animated.Value(skip ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(skip ? 0 : distance)).current;

  useEffect(() => {
    if (skip) {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const entrance = Animated.sequence([
      Animated.delay(Math.min(index, maxDelaySteps) * 70),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, skip]);

  return { opacity, transform: [{ translateY }] };
}
