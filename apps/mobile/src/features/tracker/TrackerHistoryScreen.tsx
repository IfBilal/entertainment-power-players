import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, EmptyState, ErrorState, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTrackerEntries } from '../../hooks/useTrackerEntries';
import { activityQueryKey, deleteActivity } from '../../services/supabase/activity';
import type { ActivityEntry } from '../../services/mock/tracker';

const typeLabels = { contact: 'Contact', event: 'Event', followUp: 'Follow-up', challenge: 'Challenge' } as const;

export function TrackerHistoryScreen() {
  const userId = useAuthStore((state) => state.userId);
  const { entries: trackerEntries, activityQuery } = useTrackerEntries();
  const queryClient = useQueryClient();
  const entries = [...trackerEntries].sort((a, b) => b.date.localeCompare(a.date));

  async function handleDelete(entry: ActivityEntry) {
    if (!userId) return;
    try {
      await deleteActivity(userId, entry.id);
      queryClient.setQueryData<ActivityEntry[]>(activityQueryKey(userId), (current) =>
        current?.filter((item) => item.id !== entry.id) ?? [],
      );
    } catch {
      Alert.alert('Could not delete activity', 'Check your connection and try again.');
    }
  }

  const grouped = Object.entries(
    entries.reduce<Record<string, typeof entries>>((acc, entry) => {
      (acc[entry.weekKey] ??= []).push(entry);
      return acc;
    }, {}),
  ).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>History</AppText>
      <FlatList
        data={grouped}
        keyExtractor={([weekKey]) => weekKey}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={activityQuery.isPending ? <ActivityIndicator color={colors.accentLime} /> : activityQuery.isError ? (
          <ErrorState title="Couldn't load history" description="Check your connection and try again." onRetry={() => activityQuery.refetch()} />
        ) : (
          <EmptyState
            icon="time-outline"
            title="Your week starts here."
            description="Log your first connection, event, or follow-up and start building momentum."
          />
        )}
        renderItem={({ item: [weekKey, weekEntries] }) => (
          <View style={styles.group}>
            <SectionHeader label={weekKey} />
            {weekEntries.map((entry, i) => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.timelineRail}>
                  <View style={styles.dot} />
                  {i < weekEntries.length - 1 ? <View style={styles.line} /> : null}
                </View>
                <View style={styles.rowContent}>
                  <AppText variant="bodyStrong">{entry.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>{typeLabels[entry.type]}</AppText>
                  {entry.notes ? <AppText variant="caption" color={colors.textSecondary}>{entry.notes}</AppText> : null}
                </View>
                {entry.type === 'challenge' ? null : (
                  <Pressable onPress={() => handleDelete(entry)} accessibilityLabel="Delete entry" hitSlop={8}>
                    <Ionicons name="trash-outline" size={17} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.sm },
  group: { marginBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineRail: {
    width: 16,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.accent,
    marginTop: 6,
  },
  line: {
    width: StyleSheet.hairlineWidth,
    flex: 1,
    backgroundColor: colors.borderSubtle,
    marginTop: 2,
  },
  rowContent: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingRight: spacing.sm,
  },
});
