import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { colors, spacing } from '../theme';

type ContactRowProps = {
  name: string;
  role?: string;
  company?: string;
  city?: string;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

/** Structured editorial list row — not a card per row (spec §22/§57). */
export function ContactRow({ name, role, company, city, favorite, onPress, onToggleFavorite }: ContactRowProps) {
  const bg = useRef(new Animated.Value(0)).current;

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.background, colors.surfaceSubtle],
  });

  const metaLine = [role, company].filter(Boolean).join(' · ');

  return (
    <Animated.View style={{ backgroundColor }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(bg, { toValue: 1, duration: 100, useNativeDriver: false }).start()}
        onPressOut={() => Animated.timing(bg, { toValue: 0, duration: 150, useNativeDriver: false }).start()}
        style={styles.row}
      >
        <View style={styles.text}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {name}
          </AppText>
          {metaLine ? (
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={styles.meta}>
              {metaLine}
            </AppText>
          ) : null}
          {city ? (
            <AppText variant="caption" color={colors.textTertiary} numberOfLines={1}>
              {city}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityLabel={favorite ? 'Remove favourite' : 'Add favourite'}
        >
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={20} color={colors.accent} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 6,
    minHeight: 72,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  text: {
    flex: 1,
    marginRight: spacing.sm,
    gap: 1,
  },
  meta: {
    marginTop: 1,
  },
});
