import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { IconTile } from './IconTile';
import { colors, radius, spacing, type GradientToken, type IoniconName } from '../theme';

type CategoryCardProps = {
  name: string;
  icon: IoniconName;
  count?: number;
  onPress: () => void;
  /** Rotates through the brand gradients so a list of categories reads as a
   *  set rather than six identical tiles (mockup screen 10). */
  tone?: GradientToken;
  fillColor?: string;
  glyphColor?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Directory category row: gradient icon tile, name, contact count, chevron.
 * The mockups changed this from a 2-up grid tile to a full-width row, which
 * also gives long category names room to breathe.
 */
export function CategoryCard({ name, icon, count, onPress, tone = 'brand', fillColor, glyphColor }: CategoryCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

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
      style={[styles.card, { transform: [{ scale }] }]}
      accessibilityRole="button"
      accessibilityLabel={name}
    >
      <IconTile icon={icon} tone={tone} size="md" circle fillColor={fillColor} glyphColor={glyphColor} />
      <View style={styles.text}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {name}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {count === undefined ? '—' : `${count.toLocaleString()} contact${count === 1 ? '' : 's'}`}
        </AppText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
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
    padding: spacing.md,
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
