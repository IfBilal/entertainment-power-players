import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { spacing } from '../../theme';
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
        <FormField
          label={type === 'event' ? 'EVENT NAME' : 'NAME'}
          placeholder={type === 'event' ? 'e.g. Industry mixer' : 'e.g. Jane Doe'}
          value={title}
          onChangeText={setTitle}
        />
        <FormField
          label="NOTES (OPTIONAL)"
          placeholder="Anything worth remembering"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button label="Save" onPress={save} disabled={!title.trim()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: spacing.lg, gap: spacing.md },
});
