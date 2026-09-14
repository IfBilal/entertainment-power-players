import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

const MIN_DISPLAY_MS = 1100;

export function SplashScreen({ navigation }: Props) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const status = useAuthStore((s) => s.status);
  const selectedTrackSlugs = useAuthStore((s) => s.selectedTrackSlugs);
  const minDelayElapsed = useRef(false);
  const navigated = useRef(false);

  function tryNavigate() {
    if (navigated.current || !minDelayElapsed.current) return;
    if (status === 'signedOut') {
      navigated.current = true;
      navigation.replace('IntroSlides');
    } else if (status === 'signedIn' && (selectedTrackSlugs?.length ?? 0) === 0) {
      navigated.current = true;
      navigation.replace('TrackPicker');
    }
    // signedIn with tracks already picked, or still loading: do nothing --
    // once fully resolved, RootNavigator itself swaps to the Main stack.
  }

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 420, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      minDelayElapsed.current = true;
      tryNavigate();
    }, MIN_DISPLAY_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    tryNavigate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, selectedTrackSlugs]);

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
