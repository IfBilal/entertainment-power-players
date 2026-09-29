import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { activityQueryKey, createActivity } from '../../services/supabase/activity';
import { computeWeekKey } from '../../utils/weekKey';
import type { ActivityEntry } from '../../services/mock/tracker';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'LogEntry'>;

const typeLabels = { contact: 'Contact', event: 'Event', followUp: 'Follow-up' } as const;

export function LogEntryScreen({ route, navigation }: Props) {
  const { type } = route.params;
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();

  async function save() {
    if (!title.trim() || !userId || saving) return;
    setSaving(true);
    setSaveError(false);
    try {
      const date = new Date();
      const entry = await createActivity({
        userId,
        type,
        title: title.trim(),
        notes: notes.trim() || undefined,
        date,
        weekKey: computeWeekKey(date),
      });
      queryClient.setQueryData<ActivityEntry[]>(activityQueryKey(userId), (current) => [entry, ...(current ?? [])]);
      navigation.popToTop();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
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
        <Button label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={!title.trim() || !userId || saving} />
        {saveError ? <AppText variant="caption" color={colors.danger}>Couldn't save this activity. Please try again.</AppText> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: spacing.lg, gap: spacing.md },
});
