import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { colors, radius, spacing, type IoniconName } from '../theme';

type MomentumRowProps = {
  icon: IoniconName;
  label: string;
  value: number;
  goal: number;
};

/** One row of the Tracker's weekly momentum surface: icon, number, goal, bar (spec §23). */
export function MomentumRow({ icon, label, value, goal }: MomentumRowProps) {
  const pct = goal > 0 ? value / goal : 0;
  const met = pct >= 1;

  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <View style={styles.headerLine}>
          <AppText variant="bodyStrong">{label}</AppText>
          <AppText variant="captionStrong" color={met ? colors.success : colors.textSecondary}>
            {value} / {goal}
          </AppText>
        </View>
        <ProgressBar progress={pct} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accentFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs,
  },
  headerLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
