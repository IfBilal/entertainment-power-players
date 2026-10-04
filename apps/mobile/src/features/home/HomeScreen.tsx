import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Avatar, Card, ProgressBar, ProgressRing, Screen } from '../../components';
import { colors, radius, spacing, type IoniconName } from '../../theme';
import { countsForWeek, type WeeklyGoals } from '../../services/mock/tracker';
import { useTrackerEntries } from '../../hooks/useTrackerEntries';
import { useUserGoals } from '../../hooks/useUserGoals';
import { goalsForWeek } from '../../services/supabase/goals';
import { useAuthStore } from '../../store/useAuthStore';
import { computeWeekKey } from '../../utils/weekKey';
import type { DirectoryStackParamList, MainTabParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'Home'>;

type Metric = {
  key: keyof WeeklyGoals;
  label: string;
  icon: IoniconName;
  tone: 'barAmber' | 'barLime' | 'barOrange';
  colour: string;
};

// Brand-family metric colours, distinct while remaining readable on white.
const metrics: Metric[] = [
  { key: 'contacts', label: 'Contacts', icon: 'radio-button-on', tone: 'barAmber', colour: '#FDB90B' },
  { key: 'events', label: 'Events', icon: 'ellipse', tone: 'barLime', colour: '#72D222' },
  { key: 'followUps', label: 'Follow-ups', icon: 'ellipse', tone: 'barOrange', colour: '#FA6100' },
];

const quickAccess: Array<{ label: string; icon: IoniconName; tab: keyof MainTabParamList }> = [
  { label: 'Directory', icon: 'people-outline', tab: 'Directory' },
  { label: 'Tracker', icon: 'stats-chart-outline', tab: 'Tracker' },
  { label: 'Challenges', icon: 'shield-checkmark-outline', tab: 'Challenges' },
  { label: 'Inspiration', icon: 'sparkles-outline', tab: 'Inspiration' },
];

function greeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning.';
  if (hour < 18) return 'Good afternoon.';
  return 'Good evening.';
}

/** "Apr 21 – Apr 27, 2025" for the week containing `date`. */
function weekRangeLabel(date: Date): string {
  const day = (date.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const md = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return `${md(monday)} – ${md(sunday)}, ${sunday.getFullYear()}`;
}

export function HomeScreen({ navigation }: Props) {
  const tabNavigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { entries } = useTrackerEntries();
  const goalsQuery = useUserGoals();
  const displayName = useAuthStore((s) => s.displayName);

  const now = useMemo(() => new Date(), []);
  const weekKey = computeWeekKey(now);
  const counts = countsForWeek(entries, weekKey);
  const goals = goalsForWeek(goalsQuery.data ?? {}, weekKey);

  const firstName = (displayName ?? '').trim().split(/\s+/)[0] || 'there';

  return (
    <Screen padded={false} aurora={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>GOOD TO SEE YOU</AppText>
          <View style={styles.avatarHalo}><Avatar name={displayName ?? firstName} size="lg" /></View>
          <AppText variant="display" style={styles.greeting}>{greeting(now)}</AppText>
          <AppText variant="subtitle" color={colors.accent} style={styles.firstName}>{firstName}</AppText>
        </View>

        <Card style={styles.weekCard}>
          <AppText variant="title" style={styles.weekTitle}>This Week</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.weekRange}>
            {weekRangeLabel(now)}
          </AppText>
          <View style={styles.weekFocus}><ProgressRing progress={goals.contacts ? counts.contacts / goals.contacts : 0} size={126} strokeWidth={10} label={counts.contacts + '/' + goals.contacts} /><AppText variant="captionStrong" color={colors.accent} style={styles.focusLabel}>CONTACT GOAL</AppText></View>

          <View style={styles.metrics}>
            {metrics.map((m) => {
              const value = counts[m.key];
              const target = goals[m.key];
              return (
                <View key={m.key} style={styles.metric}>
                  <View style={styles.metricRow}>
                    <Ionicons name={m.icon} size={15} color={m.colour} />
                    <AppText variant="body" style={styles.metricLabel}>
                      {m.label}
                    </AppText>
                    <AppText variant="bodyStrong">
                      {value} / {target}
                    </AppText>
                  </View>
                  <ProgressBar
                    progress={target === 0 ? 0 : value / target}
                    tone={m.tone}
                    height={7}
                  />
                </View>
              );
            })}
          </View>
        </Card>

        <AppText variant="title" style={styles.quickHeading}>
          Quick Access
        </AppText>
        <View style={styles.quickRow}>
          {quickAccess.map((q) => (
            <Pressable
              key={q.label}
              style={styles.quickItem}
              accessibilityRole="button"
              accessibilityLabel={q.label}
              onPress={() => {
                // Each tab hosts its own stack, so navigate() needs the nested
                // screen too -- a bare tab name doesn't typecheck.
                switch (q.tab) {
                  case 'Directory':
                    navigation.navigate('CategoryGrid');
                    break;
                  case 'Tracker':
                    tabNavigation.navigate('Tracker', { screen: 'TrackerDashboard' });
                    break;
                  case 'Challenges':
                    tabNavigation.navigate('Challenges', { screen: 'TrackList' });
                    break;
                  case 'Inspiration':
                    tabNavigation.navigate('Inspiration', { screen: 'QuoteFeed' });
                    break;
                  default:
                    break;
                }
              }}
            >
              <View style={styles.quickTile}>
                <Ionicons name={q.icon} size={26} color={colors.accent} />
              </View>
              <AppText variant="caption" style={styles.quickLabel}>
                {q.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
  },
  eyebrow: { letterSpacing: 1.5, marginBottom: spacing.md },
  avatarHalo: { padding: spacing.xs, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 40 },
  greeting: { marginTop: spacing.sm, textAlign: 'center' },
  firstName: { marginTop: 2, textAlign: 'center' },
  weekCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.border,
  },
  weekTitle: { textAlign: 'center' },
  weekRange: {
    marginTop: 2,
    textAlign: 'center',
  },
  weekFocus: { alignItems: 'center', marginTop: spacing.md },
  focusLabel: { marginTop: spacing.xs, letterSpacing: 1.1 },
  metrics: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  metric: {
    gap: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  metricLabel: {
    flex: 1,
  },
  quickHeading: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickItem: {
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  quickTile: {
    width: 62,
    height: 62,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.accentFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    textAlign: 'center',
  },
});
