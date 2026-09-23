import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Aurora } from './Aurora';
import { colors, spacing, type AuroraToken } from '../theme';

type ScreenProps = ViewProps & {
  padded?: boolean;
  animateIn?: boolean;
  /** Corner light-leaks behind the content. `false` for screens that supply
   *  their own backdrop (onboarding photography, the share card). */
  aurora?: AuroraToken | false;
};

export function Screen({
  padded = true,
  animateIn = true,
  aurora = 'standard',
  style,
  children,
  ...rest
}: ScreenProps) {
  const opacity = useRef(new Animated.Value(animateIn ? 0 : 1)).current;
  const translateY = useRef(new Animated.Value(animateIn ? 10 : 0)).current;

  useEffect(() => {
    if (!animateIn) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 320, useNativeDriver: true }),
    ]).start();
  }, [animateIn]);

  return (
    <View style={styles.root}>
      {aurora !== false ? <Aurora variant={aurora} /> : null}
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Animated.View
          style={[
            styles.container,
            padded && styles.padded,
            style,
            animateIn && { opacity, transform: [{ translateY }] },
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
