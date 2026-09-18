import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type SubscriptionOptionProps = {
  label: string;
  price: string;
  note?: string;
  selected: boolean;
  onPress: () => void;
};

/** Monthly/annual plan selector card on the paywall (spec §29/§66). */
export function SubscriptionOption({ label, price, note, selected, onPress }: SubscriptionOptionProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, selected && styles.cardSelected]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.radio}>{selected ? <View style={styles.radioDot} /> : null}</View>
      <View style={styles.text}>
        <AppText variant="bodyStrong">{label}</AppText>
        {note ? (
          <AppText variant="caption" color={colors.accentDeep}>
            {note}
          </AppText>
        ) : null}
      </View>
      <AppText variant="bodyStrong">{price}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentFaint,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  text: {
    flex: 1,
  },
});
