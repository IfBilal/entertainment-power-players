import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useTrackerStore } from '../../store/useTrackerStore';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'LogEntry'>;

const typeLabels = { contact: 'Contact', event: 'Event', followUp: 'Follow-up' } as const;

export function LogEntryScreen({ route, navigation }: Props) {
  const { type } = route.params;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const addEntry = useTrackerStore((s) => s.addEntry);

  function save() {
    if (!title.trim()) return;
    addEntry({ type, title: title.trim(), notes: notes.trim() || undefined, date: new Date() });
    navigation.goBack();
  }

  return (
    <Screen>
      <AppText variant="title">Log {typeLabels[type]}</AppText>
      <View style={styles.form}>
        <TextInput
          placeholder={type === 'event' ? 'Event name' : 'Name'}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
        />
        <TextInput
          placeholder="Notes (optional)"
          value={notes}
          onChangeText={setNotes}
          style={styles.input}
          placeholderTextColor={colors.textSecondary}
          multiline
        />
        <Button label="Save" onPress={save} disabled={!title.trim()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: spacing.lg, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
  },
});
