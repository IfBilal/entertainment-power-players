import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../theme';

type StatCardProps = {
  value: number;
  label: string;
  goal?: number;
};

/** Large numeric moment — e.g. "16 TOTAL ACTIONS" hero on the Tracker (spec §23/§116). */
export function StatCard({ value, label, goal }: StatCardProps) {
  return (
    <View style={styles.container}>
      <AppText variant="hero" style={styles.value}>
        {value}
      </AppText>
      <AppText variant="label" color={colors.textTertiary} style={styles.label}>
        {label}
      </AppText>
      {goal !== undefined ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.goal}>
          Goal · {goal}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  value: {
    lineHeight: 46,
  },
  label: {
    marginTop: spacing.xs,
    letterSpacing: 1.4,
  },
  goal: {
    marginTop: spacing.xs,
  },
});
