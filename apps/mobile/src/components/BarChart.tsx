import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

export type BarChartDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
};

/**
 * Minimal flexbox bar chart — deliberately not Victory Native/Skia (see
 * docs/week1-acceptance.md for the rationale). Good enough to visualise the
 * 8-week activity trend (handbook §4.3) without extra native config risk.
 */
export function BarChart({ data, height = 120 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((d) => (
        <View key={d.label} style={styles.column}>
          <View style={styles.barTrack}>
            <View style={[styles.bar, { height: Math.max(2, (d.value / max) * height) }]} />
          </View>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {d.label}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '60%',
  },
  bar: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    width: '100%',
  },
});
