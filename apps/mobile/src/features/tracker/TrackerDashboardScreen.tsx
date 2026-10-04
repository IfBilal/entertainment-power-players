import { useEffect, useRef, useState } from 'react';
import { Animated, AppState, Easing, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, BarChart, Button, Card, Divider, MomentumRow, ProgressRing, Screen, StatCard } from '../../components';
import { colors, spacing } from '../../theme';
import { useTrackerEntries } from '../../hooks/useTrackerEntries';
import { useUserGoals } from '../../hooks/useUserGoals';
import { goalsForWeek } from '../../services/supabase/goals';
import { countsForWeek, last8WeeksTotals } from '../../services/mock/tracker';
import { computeWeekKey } from '../../utils/weekKey';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/useAuthStore';
import { activityQueryKey } from '../../services/supabase/activity';
import type { TrackerStackParamList } from '../../navigation/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = NativeStackScreenProps<TrackerStackParamList, 'TrackerDashboard'>;

function GoalProgressBar({ value, goal, tint }: { value: number; goal: number; tint: string }) {
  const progress = goal > 0 ? Math.min(1, value / goal) : 0;
  const reduceMotion = useReducedMotion();
  const animated = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? progress : 0)).current;
  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      animated.setValue(progress);
      return;
    }
    const animation = Animated.timing(animated, { toValue: progress, duration: 720, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [animated, progress, reduceMotion]);
  return <View style={styles.barTrack}><Animated.View style={[styles.barFill, { backgroundColor: tint, width: animated.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>;
}

export function TrackerDashboardScreen({ navigation }: Props) {
  const [now, setNow] = useState(() => new Date());
  const lastWeek = useRef(computeWeekKey(now));
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.userId);
  const { entries, activityQuery } = useTrackerEntries();
  const goalsQuery = useUserGoals();
  const weekKey = computeWeekKey(now);
  const counts = countsForWeek(entries, weekKey);
  const goals = goalsForWeek(goalsQuery.data ?? {}, weekKey);
  const chartData = last8WeeksTotals(entries, now).map((w) => ({ label: `${w.weekKey.slice(2, 4)}-${w.weekKey.slice(5)}`, value: w.total }));

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    const refresh = () => {
      const next = new Date();
      const nextWeek = computeWeekKey(next);
      if (nextWeek !== lastWeek.current && userId) void queryClient.invalidateQueries({ queryKey: activityQueryKey(userId) });
      lastWeek.current = nextWeek;
      setNow(next);
    };
    const timer = setInterval(refresh, 30_000);
    const listener = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        refresh();
        if (userId) void queryClient.invalidateQueries({ queryKey: activityQueryKey(userId) });
      }
    });
    return () => { clearInterval(timer); listener.remove(); };
  }, [queryClient, userId]);

  const rows: Array<{ key: 'contacts' | 'events' | 'followUps'; label: string; icon: 'people-outline' | 'calendar-outline' | 'return-up-forward-outline'; tint: string; wash: string }> = [
    { key: 'contacts', label: 'Contacts', icon: 'people-outline', tint: colors.accent, wash: colors.accentSoft },
    { key: 'events', label: 'Events', icon: 'calendar-outline', tint: colors.accentOrange, wash: colors.accentOrangeSoft },
    { key: 'followUps', label: 'Follow-ups', icon: 'return-up-forward-outline', tint: colors.warning, wash: colors.warningSoft },
  ];

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>MAKE EVERY CONNECTION COUNT</AppText>
        <AppText variant="display" style={styles.heading}>Tracker</AppText>
        <View style={styles.tabs}>
          <View style={styles.activeTab}><AppText variant="bodyStrong">This Week</AppText></View>
          <Pressable
            onPress={() => navigation.navigate('TrackerHistory')}
            accessibilityRole="button"
            accessibilityLabel="Week History"
            style={styles.historyTab}
          >
            <AppText variant="body" color={colors.textSecondary}>Week History</AppText>
          </Pressable>
        </View>
        <AppText variant="caption" color={colors.textSecondary} style={styles.date}>{weekKey}</AppText>
        <Pressable onPress={() => navigation.navigate('GoalsEditor')} accessibilityRole="button" accessibilityLabel="Edit weekly goals" style={styles.editGoals}>
          <AppText variant="captionStrong" color={colors.accentLime}>Edit weekly goals</AppText>
        </Pressable>
        {activityQuery.isError ? (
          <Pressable onPress={() => activityQuery.refetch()} accessibilityRole="button" accessibilityLabel="Retry tracker activity">
            <AppText variant="caption" color={colors.danger}>Couldn't load activity. Tap to retry.</AppText>
          </Pressable>
        ) : null}

        <View style={styles.progressWrap}>
          <View style={styles.ringHalo}><ProgressRing progress={goals.contacts ? counts.contacts / goals.contacts : 0} size={184} strokeWidth={15} /></View>
          <View testID="tracker-progress-copy" style={styles.progressCopy}>
            <AppText variant="numeric">{counts.contacts}/{goals.contacts}</AppText>
            <AppText variant="captionStrong" color={colors.textSecondary}>CONTACTS</AppText>
            {goals.contacts === 0 ? <AppText variant="caption" color={colors.textSecondary}>No goal set</AppText> : null}
          </View>
        </View>
        <View style={styles.metrics}>
          {rows.map((row) => (
            <Card key={row.key} style={styles.metricCard} elevation="none">
              <View style={styles.metricTop}>
                <View style={[styles.metricIcon, { backgroundColor: row.wash }]}><Ionicons name={row.icon} size={19} color={row.tint} /></View>
                <AppText variant="bodyStrong" style={styles.metricLabel}>{row.label}</AppText>
                <AppText variant="subtitle" color={row.tint}>{counts[row.key]}<AppText variant="captionStrong" color={colors.textSecondary}>/{goals[row.key]}</AppText></AppText>
              </View>
              <View accessibilityRole="progressbar" accessibilityLabel={`${row.label}: ${counts[row.key]} of ${goals[row.key]}`} accessibilityValue={{ min: 0, max: goals[row.key] || 1, now: Math.min(counts[row.key], goals[row.key] || 1) }}><GoalProgressBar value={counts[row.key]} goal={goals[row.key]} tint={row.tint} /></View>
              {goals[row.key] === 0 ? <AppText variant="caption" color={colors.textSecondary}>No goal set</AppText> : null}
            </Card>
          ))}
        </View>

        <View style={styles.section}>
          <AppText variant="title" style={styles.sectionHeading}>Weekly Activity</AppText>
          <Card style={styles.chartCard} elevation="none">
            <BarChart data={chartData} />
          </Card>
        </View>

        <Button label="Log Activity" fullWidth onPress={() => navigation.navigate('LogActivity')} />
      </ScrollView>

    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  eyebrow: { textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  heading: { marginBottom: spacing.md, textAlign: 'center' },
  tabs: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm },
  activeTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, backgroundColor: colors.accentSoft },
  historyTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  date: { marginTop: spacing.md, marginBottom: spacing.sm, textAlign: 'center' },
  editGoals: { alignSelf: 'flex-end', paddingVertical: spacing.xs, marginBottom: spacing.sm },
  progressWrap: { alignItems: 'center', marginVertical: spacing.lg },
  ringHalo: { padding: 12, borderRadius: 112, backgroundColor: colors.accentFaint },
  progressCopy: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metrics: { gap: spacing.sm, marginBottom: spacing.lg },
  metricCard: { flex: 1, padding: spacing.md, gap: spacing.md, backgroundColor: colors.surface, borderColor: colors.border },
  metricTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  metricIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  metricLabel: { flex: 1 },
  barTrack: { height: 9, borderRadius: 5, backgroundColor: colors.surfaceStrong, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  section: { marginBottom: spacing.md },
  sectionHeading: { textAlign: 'center', marginBottom: spacing.sm },
  chartCard: { backgroundColor: colors.surfaceSubtle },
});
