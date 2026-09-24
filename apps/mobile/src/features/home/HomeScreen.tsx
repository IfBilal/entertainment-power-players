import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Avatar, Card, ProgressBar, Screen } from '../../components';
import { colors, radius, spacing, type IoniconName } from '../../theme';
import { countsForWeek, type WeeklyGoals } from '../../services/mock/tracker';
import { useTrackerStore } from '../../store/useTrackerStore';
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

// Colours sampled from the mockup's three bars: amber, lime, orange.
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
  const entries = useTrackerStore((s) => s.entries);
  const goalsForWeek = useTrackerStore((s) => s.goalsForWeek);
  const displayName = useAuthStore((s) => s.displayName);

  const now = useMemo(() => new Date(), []);
  const weekKey = computeWeekKey(now);
  const counts = countsForWeek(entries, weekKey);
  const goals = goalsForWeek(weekKey);

  const firstName = (displayName ?? '').trim().split(/\s+/)[0] || 'there';

  return (
    <Screen padded={false} aurora="standard">
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.greetingBlock}>
            <AppText variant="display">{greeting(now)}</AppText>
            <View style={styles.nameRow}>
              <AppText variant="display">{firstName}</AppText>
              <Ionicons name="sparkles" size={22} color={colors.accentAmber} />
            </View>
          </View>
          <Avatar name={displayName ?? firstName} size="lg" />
        </View>

        <Card style={styles.weekCard}>
          <AppText variant="subtitle">This Week</AppText>
          <AppText variant="caption" color={colors.textSecondary} style={styles.weekRange}>
            {weekRangeLabel(now)}
          </AppText>

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

        <AppText variant="subtitle" style={styles.quickHeading}>
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
                <Ionicons name={q.icon} size={24} color={colors.accentLime} />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  greetingBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  weekCard: {
    marginTop: spacing.lg,
  },
  weekRange: {
    marginTop: 2,
  },
  metrics: {
    marginTop: spacing.lg,
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
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    textAlign: 'center',
  },
});
