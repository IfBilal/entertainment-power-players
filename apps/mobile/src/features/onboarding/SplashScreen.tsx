import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Aurora, Logo } from '../../components';
import { colors, spacing } from '../../theme';
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

  // The min-display timer below fires exactly once, from a useEffect with an
  // empty dep array -- its callback closure is frozen at mount time. Reading
  // `status`/`selectedTrackSlugs` directly from that closure meant it always
  // saw whatever they were on first render (typically 'loading'), forever,
  // no matter how much time passed or how many times the real values
  // changed. If auth resolved *before* the timer fired -- common, and more
  // likely the faster the connection -- the other effect (which does see
  // fresh values) would run first but bail out because minDelayElapsed
  // wasn't set yet, and then the timer's stale closure would run and match
  // neither branch. Nothing ever called tryNavigate again after that:
  // permanently stuck on this screen. Confirmed live, repeatedly, worst on
  // fast connections (USB) rather than slow ones (Wi-Fi) -- backwards from
  // what a network-flakiness explanation would predict, which is what
  // pointed at a timing bug here instead. Refs are mutable and read fresh on
  // every call regardless of which closure captured them, so routing both
  // callers through these instead of the raw state variables fixes it.
  const statusRef = useRef(status);
  const tracksRef = useRef(selectedTrackSlugs);
  statusRef.current = status;
  tracksRef.current = selectedTrackSlugs;

  function tryNavigate() {
    if (navigated.current || !minDelayElapsed.current) return;
    const currentStatus = statusRef.current;
    const currentTracks = tracksRef.current;
    if (currentStatus === 'signedOut') {
      navigated.current = true;
      navigation.replace('IntroSlides');
    } else if (currentStatus === 'signedIn' && (currentTracks?.length ?? 0) === 0) {
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
      <Aurora variant="streaks" />
      <Animated.View style={[styles.mark, { opacity, transform: [{ scale }] }]}>
        {/* The mockup pairs the star+epp mark with its own white wordmark set
            below it, rather than the supplied lockup whose wordmark is green
            and too small to read at this size. */}
        <Logo variant="mark" width={252} />
        <AppText variant="label" color={colors.textPrimary} style={styles.wordmarkTop}>
          ENTERTAINMENT
        </AppText>
        <AppText variant="title" color={colors.textPrimary} style={styles.wordmarkMain}>
          POWER PLAYERS
        </AppText>
      </Animated.View>
      <Animated.View style={[styles.taglineWrap, { opacity }]}>
        <AppText variant="body" color={colors.textSecondary} style={styles.tagline}>
          Real Connections.
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.tagline}>
          Bigger Opportunities.
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
  wordmarkTop: {
    marginTop: spacing.md,
    letterSpacing: 3.4,
  },
  wordmarkMain: {
    marginTop: 2,
    letterSpacing: 2.2,
  },
  /** The mockup sets the tagline low on the screen, well clear of the logo,
   *  rather than directly beneath it. */
  taglineWrap: {
    position: 'absolute',
    bottom: spacing.xxl,
    alignItems: 'center',
  },
  tagline: {
    textAlign: 'center',
  },
});
