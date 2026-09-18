import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { colors, radius, spacing, type IoniconName } from '../theme';

type CategoryCardProps = {
  name: string;
  icon: IoniconName;
  count?: number;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Directory category tile: oversized low-opacity icon behind the content,
 * foreground icon, name, count (spec §22/§120) — designed without needing
 * photography, since contacts never carry photos.
 */
export function CategoryCard({ name, icon, count, onPress }: CategoryCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function pressIn() {
    Animated.spring(scale, { toValue: 0.98, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
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
      <Ionicons name={icon} size={64} color={colors.accent} style={styles.ghostIcon} />
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <AppText variant="bodyStrong" numberOfLines={1} style={styles.name}>
        {name}
      </AppText>
      <AppText variant="caption" color={colors.textSecondary}>
        {count === undefined ? '—' : `${count} contact${count === 1 ? '' : 's'}`}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minHeight: 132,
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.lg,
    padding: spacing.md,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  ghostIcon: {
    position: 'absolute',
    top: -10,
    right: -10,
    opacity: 0.1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    marginBottom: 2,
  },
});
