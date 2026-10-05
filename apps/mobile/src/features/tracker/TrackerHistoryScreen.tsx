import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, FlatList, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, EmptyState, ErrorState, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useTrackerEntries } from '../../hooks/useTrackerEntries';
import { activityQueryKey, deleteActivity } from '../../services/supabase/activity';
import type { ActivityEntry } from '../../services/mock/tracker';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const typeLabels = { contact: 'Contact', event: 'Event', followUp: 'Follow-up', challenge: 'Challenge' } as const;

function HistoryRow({ entry, last, deleting, onDelete }: { entry: ActivityEntry; last: boolean; deleting: boolean; onDelete: () => void }) {
  const offset = useRef(new Animated.Value(0)).current;
  const [revealed, setRevealed] = useState(false);
  const reduceMotion = useReducedMotion();
  const settle = (show: boolean) => {
    if (reduceMotion) offset.setValue(show ? -92 : 0);
    else Animated.spring(offset, { toValue: show ? -92 : 0, useNativeDriver: true }).start();
  };
  const swipe = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => entry.type !== 'challenge' && Math.abs(gesture.dx) > 15 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.3,
    onPanResponderMove: (_, gesture) => offset.setValue(Math.max(-92, Math.min(0, gesture.dx + (revealed ? -92 : 0)))),
    onPanResponderRelease: (_, gesture) => {
      const show = gesture.dx < -45 || (revealed && gesture.dx < 35);
      setRevealed(show);
      settle(show);
    },
    onPanResponderTerminate: () => settle(revealed),
  }), [entry.type, offset, revealed, reduceMotion]);

  return <View style={styles.swipeContainer}>
    {entry.type !== 'challenge' ? <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${entry.title}`} onPress={onDelete} disabled={deleting} style={styles.deleteAction}>
      {deleting ? <ActivityIndicator color={colors.textPrimary} /> : <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />}
      <AppText variant="captionStrong">Delete</AppText>
    </Pressable> : null}
    <Animated.View {...swipe.panHandlers} style={[styles.row, { transform: [{ translateX: offset }] }]}>
      <View style={styles.timelineRail}>
        <View style={styles.dot} />
        {!last ? <View style={styles.line} /> : null}
      </View>
      <View style={styles.rowContent}>
        <AppText variant="bodyStrong">{entry.title}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>{typeLabels[entry.type]}</AppText>
        {entry.notes ? <AppText variant="caption" color={colors.textSecondary}>{entry.notes}</AppText> : null}
      </View>
      {entry.type !== 'challenge' ? <Pressable accessibilityRole="button" accessibilityLabel={`Reveal delete for ${entry.title}`} onPress={() => { setRevealed(true); settle(true); }} style={styles.revealButton}>
        <Ionicons name="chevron-back-outline" size={18} color={colors.textTertiary} />
      </Pressable> : null}
    </Animated.View>
  </View>;
}

export function TrackerHistoryScreen() {
  const userId = useAuthStore((state) => state.userId);
  const { entries: trackerEntries, activityQuery } = useTrackerEntries();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const entries = [...trackerEntries].sort((a, b) => b.date.localeCompare(a.date));

  async function handleDelete(entry: ActivityEntry) {
    if (!userId || deletingId) return;
    setDeletingId(entry.id);
    try {
      await deleteActivity(userId, entry.id);
      queryClient.setQueryData<ActivityEntry[]>(activityQueryKey(userId), (current) =>
        current?.filter((item) => item.id !== entry.id) ?? [],
      );
      void queryClient.invalidateQueries({ queryKey: activityQueryKey(userId) });
    } catch {
      Alert.alert('Could not delete activity', 'Check your connection and try again.');
    } finally {
      setDeletingId(null);
    }
  }

  function confirmDelete(entry: ActivityEntry) {
    Alert.alert('Delete activity?', `${entry.title} will be removed from your history and weekly totals.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { void handleDelete(entry); } },
    ]);
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
            {weekEntries.map((entry, i) => <HistoryRow key={entry.id} entry={entry} last={i === weekEntries.length - 1} deleting={deletingId === entry.id} onDelete={() => confirmDelete(entry)} />)}
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.sm, textAlign: 'center' },
  group: { marginBottom: spacing.lg },
  swipeContainer: { overflow: 'hidden', minHeight: 65 },
  deleteAction: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 92, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 65,
    backgroundColor: colors.background,
  },
  revealButton: { padding: spacing.md },
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
