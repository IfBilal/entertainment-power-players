import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, EmptyState, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import { useTrackerStore } from '../../store/useTrackerStore';

const typeLabels = { contact: 'Contact', event: 'Event', followUp: 'Follow-up', challenge: 'Challenge' } as const;

export function TrackerHistoryScreen() {
  const entries = useTrackerStore((s) => s.entries);
  const removeEntry = useTrackerStore((s) => s.removeEntry);

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
        ListEmptyComponent={
          <EmptyState
            icon="time-outline"
            title="Your week starts here."
            description="Log your first connection, event, or follow-up and start building momentum."
          />
        }
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
                </View>
                <Pressable onPress={() => removeEntry(entry.id)} accessibilityLabel="Delete entry" hitSlop={8}>
                  <Ionicons name="trash-outline" size={17} color={colors.textTertiary} />
                </Pressable>
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
