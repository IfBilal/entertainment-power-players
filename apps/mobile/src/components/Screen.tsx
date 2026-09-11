import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

type ScreenProps = ViewProps & {
  padded?: boolean;
  animateIn?: boolean;
};

export function Screen({ padded = true, animateIn = true, style, children, ...rest }: ScreenProps) {
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
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
  },
});
