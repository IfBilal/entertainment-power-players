import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, EmptyState, Screen } from '../../components';
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
        ListEmptyComponent={<EmptyState icon="time-outline" title="No activity yet" />}
        renderItem={({ item: [weekKey, weekEntries] }) => (
          <View style={styles.group}>
            <AppText variant="label" color={colors.textSecondary}>{weekKey}</AppText>
            {weekEntries.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View>
                  <AppText variant="bodyStrong">{entry.title}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>{typeLabels[entry.type]}</AppText>
                </View>
                <Pressable onPress={() => removeEntry(entry.id)} accessibilityLabel="Delete entry">
                  <Ionicons name="trash-outline" size={18} color={colors.danger} />
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
  group: { marginBottom: spacing.md, gap: spacing.xs },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
