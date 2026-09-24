import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { Aurora } from './Aurora';
import { colors, spacing, type AuroraToken } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type ScreenProps = ViewProps & {
  padded?: boolean;
  animateIn?: boolean;
  /** Corner light-leaks behind the content. `false` for screens that supply
   *  their own backdrop (onboarding photography, the share card). */
  aurora?: AuroraToken | 'streaks' | false;
};

export function Screen({
  padded = true,
  animateIn = true,
  aurora = 'standard',
  style,
  children,
  ...rest
}: ScreenProps) {
  const isFocused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(animateIn && !reduceMotion ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animateIn && !reduceMotion ? 26 : 0)).current;
  const scale = useRef(new Animated.Value(animateIn && !reduceMotion ? 0.985 : 1)).current;

  useEffect(() => {
    if (!animateIn || !isFocused || reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(1);
      return;
    }

    opacity.setValue(0);
    translateY.setValue(26);
    scale.setValue(0.985);
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 340, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, speed: 16, bounciness: 5, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 18, bounciness: 4, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [animateIn, isFocused, opacity, reduceMotion, scale, translateY]);

  return (
    <View style={styles.root}>
      {aurora !== false ? <Aurora variant={aurora} /> : null}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.container,
            padded && styles.padded,
            style,
            animateIn && { opacity, transform: [{ translateY }, { scale }] },
          ]}
          {...rest}
        >
          {children}
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
