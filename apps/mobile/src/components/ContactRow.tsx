import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Avatar } from './Avatar';
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

/**
 * Directory list row: initials avatar, name, one meta line, favourite toggle.
 * The mockups put an avatar on every row — see Avatar for why these are
 * initials on a brand gradient rather than photographs.
 */
export function ContactRow({ name, role, company, city, favorite, onPress, onToggleFavorite }: ContactRowProps) {
  const bg = useRef(new Animated.Value(0)).current;

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.05)'],
  });

  const metaLine = [role, company, city].filter(Boolean).join(' · ');

  return (
    <Animated.View style={{ backgroundColor }}>
      <Pressable
        onPress={onPress}
        onPressIn={() => Animated.timing(bg, { toValue: 1, duration: 100, useNativeDriver: false }).start()}
        onPressOut={() => Animated.timing(bg, { toValue: 0, duration: 150, useNativeDriver: false }).start()}
        style={styles.row}
      >
        <Avatar name={name} size="md" />
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
});
