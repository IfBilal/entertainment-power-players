import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { IconTile } from './IconTile';
import { colors, radius, spacing, type GradientToken, type IoniconName } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type CategoryCardProps = {
  slug: string;
  name: string;
  icon: IoniconName;
  count?: number;
  onPress: () => void;
  /** Brand tone for callers that do not supply a category-specific palette. */
  tone?: GradientToken;
  fillColor?: string;
  glyphColor?: string;
  entranceIndex?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** Directory category row with category-only artwork and a large touch target. */
export function CategoryCard({ slug, name, icon, count, onPress, tone = 'brand', fillColor, glyphColor, entranceIndex = 0 }: CategoryCardProps) {
  const reduceMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? 0 : 22)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }
    const entrance = Animated.sequence([
      Animated.delay(Math.min(entranceIndex, 5) * 70),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [entranceIndex, opacity, reduceMotion, translateY]);

  function pressIn() {
    Animated.spring(scale, { toValue: 0.985, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  }
  function pressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      style={[styles.card, { opacity, transform: [{ translateY }, { scale }] }]}
      accessibilityRole="button"
      accessibilityLabel={`${name} category, ${count === undefined ? 'count unavailable' : `${count.toLocaleString()} contact${count === 1 ? '' : 's'}`}`}
    >
      <IconTile icon={icon} categorySlug={slug} tone={tone} size="lg" circle fillColor={fillColor} glyphColor={glyphColor} />
      <View style={styles.text}>
        <AppText variant="subtitle" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {count === undefined ? '—' : `${count.toLocaleString()} contact${count === 1 ? '' : 's'}`}
        </AppText>
      </View>
      <View style={styles.arrow}><Ionicons name="arrow-forward" size={18} color={glyphColor ?? colors.accent} /></View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    minHeight: 96,
    padding: spacing.md,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  arrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceSubtle, alignItems: 'center', justifyContent: 'center' },
});
