import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

export type BarChartDatum = {
  label: string;
  value: number;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
};

function Bar({ value, max, height, current }: { value: number; max: number; height: number; current: boolean }) {
  const targetHeight = Math.max(3, (value / max) * height);
  const reduceMotion = useReducedMotion();
  const grow = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? targetHeight : 0)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      grow.setValue(targetHeight);
      return;
    }
    const animation = Animated.timing(grow, { toValue: targetHeight, duration: 650, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [grow, targetHeight, reduceMotion]);

  return <Animated.View style={[styles.bar, current ? styles.barCurrent : styles.barHistorical, { height: grow }]} />;
}

/**
 * Minimal flexbox bar chart — deliberately not Victory Native/Skia (see
 * docs/week1-acceptance.md for the rationale). Good enough to visualise the
 * 8-week activity trend (handbook §4.3) without extra native config risk.
 * The last bar (current week) is emphasised in accent; earlier weeks are
 * muted, per spec §117.
 */
export function BarChart({ data, height = 120 }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <View style={[styles.container, { height: height + 24 }]}>
      {data.map((d, i) => (
        <View key={d.label} style={styles.column}>
          <View style={styles.barTrack}>
            <Bar value={d.value} max={max} height={height} current={i === data.length - 1} />
          </View>
          <AppText variant="caption" color={colors.textMuted} numberOfLines={1}>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '55%',
  },
  bar: {
    borderRadius: radius.xs,
    width: '100%',
  },
  barCurrent: {
    backgroundColor: colors.accent,
  },
  barHistorical: {
    backgroundColor: '#BEDDC5',
  },
});
