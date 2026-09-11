import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => navigation.replace('IntroSlides'), 1100);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mark, { opacity, transform: [{ scale }] }]}>
        <View style={styles.badge}>
          <AppText variant="title" color={colors.textInverse}>PP</AppText>
        </View>
        <AppText variant="display" style={styles.wordmark}>
          Power Players
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.tagline}>
          Build your career in entertainment
        </AppText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  mark: {
    alignItems: 'center',
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  wordmark: {
    textAlign: 'center',
  },
  tagline: {
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
