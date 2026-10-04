import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { CategoryGlyph } from './CategoryGlyph';
import { colors, spacing } from '../theme';

type ContactRowProps = {
  name: string;
  categorySlug: string;
  role?: string;
  company?: string;
  city?: string;
  rowHeight: number;
  favorite: boolean;
  onPress: () => void;
  onToggleFavorite: () => void;
};

/** Directory list row with a category pictogram rather than a portrait. */
export function ContactRow({ name, categorySlug, role, company, city, rowHeight, favorite, onPress, onToggleFavorite }: ContactRowProps) {
  const bg = useRef(new Animated.Value(0)).current;

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(33,107,54,0)', 'rgba(33,107,54,0.06)'],
  });

  const metaLine = [role, company, city].filter(Boolean).join(' · ');

  return (
    <Animated.View style={{ backgroundColor }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(bg, { toValue: 1, duration: 100, useNativeDriver: false }).start()}
        onPressOut={() => Animated.timing(bg, { toValue: 0, duration: 150, useNativeDriver: false }).start()}
        style={[styles.row, { height: rowHeight }]}
      >
        <View style={styles.categoryIcon}><CategoryGlyph slug={categorySlug} size={24} color={colors.accent} /></View>
        <View style={styles.text}>
          <AppText variant="bodyStrong" numberOfLines={1}>
            {name}
          </AppText>
          {metaLine ? (
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
              {metaLine}
            </AppText>
          ) : null}
        </View>
        <Pressable
          onPress={onToggleFavorite}
          hitSlop={10}
          accessibilityLabel={favorite ? 'Remove favourite' : 'Add favourite'}
        >
          <Ionicons
            name={favorite ? 'star' : 'star-outline'}
            size={20}
            color={favorite ? colors.accentAmber : colors.textTertiary}
          />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 72,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
});
