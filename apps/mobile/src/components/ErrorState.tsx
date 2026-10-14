import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing, type IoniconName } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type ErrorStateProps = {
  icon?: IoniconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

/** Calm, useful error surface — never a raw exception (spec §20). */
export function ErrorState({ icon = 'cloud-offline-outline', title, description, actionLabel = 'Try again', onRetry }: ErrorStateProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      return;
    }
    // Calmer than EmptyState's bounce-in: a plain fade, since this surface
    // reports a failure and shouldn't read as playful.
    const animation = Animated.timing(opacity, { toValue: 1, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion]);

  return (
    <Animated.View style={[styles.container, { opacity }]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color={colors.danger} />
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {onRetry ? (
        <View style={styles.button}>
          <Button label={actionLabel} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: 260,
  },
  button: {
    marginTop: spacing.md,
  },
});
