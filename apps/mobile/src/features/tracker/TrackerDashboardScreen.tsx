import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, BarChart, Button, Card, Divider, MomentumRow, ProgressRing, Screen, StatCard } from '../../components';
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

  const totalActions = counts.contacts + counts.events + counts.followUps;
  const totalGoal = goals.contacts + goals.events + goals.followUps;

  const rows: Array<{ key: 'contacts' | 'events' | 'followUps'; label: string; icon: 'people-outline' | 'calendar-outline' | 'return-up-forward-outline' }> = [
    { key: 'contacts', label: 'Contacts', icon: 'people-outline' },
    { key: 'events', label: 'Events', icon: 'calendar-outline' },
    { key: 'followUps', label: 'Follow-ups', icon: 'return-up-forward-outline' },
  ];

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title" style={styles.heading}>Tracker</AppText>
        <View style={styles.tabs}><AppText variant="bodyStrong">This Week</AppText><AppText variant="body" color={colors.textSecondary}>Week History</AppText></View>
        <AppText variant="caption" color={colors.textSecondary} style={styles.date}>{weekKey}</AppText>

        <View style={styles.progressWrap}>
          <ProgressRing progress={goals.contacts ? counts.contacts / goals.contacts : 0} size={170} strokeWidth={14} />
          <View testID="tracker-progress-copy" style={styles.progressCopy}>
            <AppText variant="numeric">{counts.contacts}/{goals.contacts}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>Contacts</AppText>
          </View>
        </View>
        <View style={styles.metrics}>
          {rows.filter((r) => r.key !== 'contacts').map((row) => (
            <Card key={row.key} style={styles.metricCard} elevation="none"><AppText variant="bodyStrong">{row.label}</AppText><AppText variant="subtitle"><AppText variant="bodyStrong" color={colors.accentOrange}>{counts[row.key]}</AppText> / {goals[row.key]}</AppText></Card>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="title">Weekly Activity</AppText>
          <Card style={styles.chartCard} elevation="none">
            <BarChart data={chartData} />
          </Card>
        </View>

        <Button label="Log Activity" onPress={() => navigation.navigate('LogActivity')} />
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  heading: { marginBottom: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  date: { marginTop: spacing.md, marginBottom: spacing.sm },
  progressWrap: { alignItems: 'center', marginVertical: spacing.md },
  progressCopy: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  metricCard: { flex: 1, padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface },
  section: { marginBottom: spacing.md },
  chartCard: { backgroundColor: colors.surfaceSubtle },
});
