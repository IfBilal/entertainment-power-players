import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, BarChart, Button, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useTrackerStore } from '../../store/useTrackerStore';
import { countsForWeek, last8WeeksTotals } from '../../services/mock/tracker';
import { computeWeekKey } from '../../utils/weekKey';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'TrackerDashboard'>;

export function TrackerDashboardScreen({ navigation }: Props) {
  const entries = useTrackerStore((s) => s.entries);
  const goalsForWeek = useTrackerStore((s) => s.goalsForWeek);
  const now = new Date();
  const weekKey = computeWeekKey(now);
  const counts = countsForWeek(entries, weekKey);
  const goals = goalsForWeek(weekKey);
  const chartData = last8WeeksTotals(entries, now).map((w, i) => ({ label: `W${i + 1}`, value: w.total }));

  const rows: Array<{ key: 'contacts' | 'events' | 'followUps'; label: string }> = [
    { key: 'contacts', label: 'Contacts' },
    { key: 'events', label: 'Events' },
    { key: 'followUps', label: 'Follow-ups' },
  ];

  return (
    <Screen>
      <AppText variant="title">This week</AppText>
      <View style={styles.progressList}>
        {rows.map((row) => {
          const value = counts[row.key];
          const goal = goals[row.key];
          const pct = goal > 0 ? Math.min(1, value / goal) : 0;
          return (
            <Card key={row.key} style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <AppText variant="bodyStrong">{row.label}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {value} / {goal}
                </AppText>
              </View>
              <View style={styles.track}>
                <View style={[styles.fill, { width: `${pct * 100}%` }]} />
              </View>
            </Card>
          );
        })}
      </View>

      <Button label="Log an entry" onPress={() => navigation.navigate('LogEntry', { type: 'contact' })} />
      <View style={styles.spacer} />

      <AppText variant="subtitle">Last 8 weeks</AppText>
      <Card style={styles.chartCard}>
        <BarChart data={chartData} />
      </Card>

      <View style={styles.footerRow}>
        <Button label="Edit goals" variant="secondary" onPress={() => navigation.navigate('GoalsEditor')} />
        <Button label="History" variant="secondary" onPress={() => navigation.navigate('TrackerHistory')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  progressList: { marginTop: spacing.md, gap: spacing.sm, marginBottom: spacing.md },
  progressCard: { gap: spacing.xs },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  spacer: { height: spacing.lg },
  chartCard: { marginTop: spacing.sm, marginBottom: spacing.lg },
  footerRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
});
