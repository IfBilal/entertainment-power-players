import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppText } from './AppText';
import { colors, radius, spacing, type IoniconName, type MaterialCommunityIconName } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type EmptyStateProps = {
  icon: IoniconName | MaterialCommunityIconName;
  /** Defaults to Ionicons; set 'mci' to render `icon` from MaterialCommunityIcons instead. */
  iconFamily?: 'ionicons' | 'mci';
  title: string;
  description?: string;
};

export function EmptyState({ icon, iconFamily = 'ionicons', title, description }: EmptyStateProps) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? 1 : 0.92)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      scale.setValue(1);
      return;
    }
    const animation = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 14, bounciness: 6, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [opacity, reduceMotion, scale]);

  return (
    <Animated.View style={[styles.container, { opacity, transform: [{ scale }] }]}>
      <View style={styles.iconWrap}>
        {iconFamily === 'mci'
          ? <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={26} color={colors.accent} />
          : <Ionicons name={icon as IoniconName} size={26} color={colors.accent} />}
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.description}>
          {description}
        </AppText>
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
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
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
});
