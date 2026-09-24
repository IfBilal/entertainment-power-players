import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, BarChart, BottomSheet, Button, Card, Divider, MomentumRow, Screen, SectionHeader, StatCard } from '../../components';
import { colors, spacing } from '../../theme';
import { useTrackerStore } from '../../store/useTrackerStore';
import { countsForWeek, last8WeeksTotals } from '../../services/mock/tracker';
import { computeWeekKey } from '../../utils/weekKey';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'TrackerDashboard'>;

const logOptions: Array<{ type: 'contact' | 'event' | 'followUp'; label: string }> = [
  { type: 'contact', label: 'Contact' },
  { type: 'event', label: 'Event' },
  { type: 'followUp', label: 'Follow-up' },
];

export function TrackerDashboardScreen({ navigation }: Props) {
  const entries = useTrackerStore((s) => s.entries);
  const goalsForWeek = useTrackerStore((s) => s.goalsForWeek);
  const [logSheetOpen, setLogSheetOpen] = useState(false);
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

  function openLog(type: 'contact' | 'event' | 'followUp') {
    setLogSheetOpen(false);
    navigation.navigate('LogEntry', { type });
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title" style={styles.heading}>Tracker</AppText>
        <View style={styles.tabs}><AppText variant="bodyStrong">This Week</AppText><AppText variant="body" color={colors.textSecondary}>Week History</AppText></View>
        <AppText variant="caption" color={colors.textSecondary} style={styles.date}>{weekKey}</AppText>

        <Card style={styles.momentumCard} elevation="raised">
          <StatCard value={totalActions} label="TOTAL ACTIONS" goal={totalGoal} />
          <Divider tone="subtle" style={styles.momentumDivider} />
          {rows.map((row) => (
            <MomentumRow key={row.key} icon={row.icon} label={row.label} value={counts[row.key]} goal={goals[row.key]} />
          ))}
        </Card>

        <Button label="Log activity" onPress={() => setLogSheetOpen(true)} />

        <View style={styles.section}>
          <SectionHeader label="YOUR NETWORKING RHYTHM" />
          <AppText variant="caption" color={colors.textSecondary} style={styles.chartSubtitle}>
            Activity across the last 8 weeks
          </AppText>
          <Card style={styles.chartCard} elevation="none">
            <BarChart data={chartData} />
          </Card>
        </View>

        <View style={styles.footerRow}>
          <Button label="Edit goals" variant="secondary" onPress={() => navigation.navigate('GoalsEditor')} />
          <Button label="History" variant="secondary" onPress={() => navigation.navigate('TrackerHistory')} />
        </View>
      </ScrollView>

      <BottomSheet visible={logSheetOpen} onClose={() => setLogSheetOpen(false)}>
        <AppText variant="subtitle" style={styles.sheetTitle}>Log activity</AppText>
        <View style={styles.sheetOptions}>
          {logOptions.map((opt) => (
            <Button key={opt.type} label={opt.label} variant="secondary" onPress={() => openLog(opt.type)} />
          ))}
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  heading: { marginBottom: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  date: { marginTop: spacing.md, marginBottom: spacing.sm },
  momentumCard: { marginBottom: spacing.md, gap: 0 },
  momentumDivider: { marginVertical: spacing.sm },
  section: { marginTop: spacing.lg, marginBottom: spacing.sm },
  chartSubtitle: { marginTop: -spacing.xs, marginBottom: spacing.sm },
  chartCard: { backgroundColor: colors.surfaceSubtle },
  footerRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  sheetTitle: { marginBottom: spacing.xs },
  sheetOptions: { gap: spacing.sm },
});
