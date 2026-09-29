import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import { fetchContactChoices } from '../../services/supabase/directory';
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
  const [mode, setMode] = useState<'manual' | 'directory'>('manual');
  const [contactId, setContactId] = useState<string | null>(null);
  const [contactSearch, setContactSearch] = useState('');
  const [eventDate, setEventDate] = useState(() => new Date());
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [saveError, setSaveError] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const isPro = useAppStore((state) => state.isPro);
  const queryClient = useQueryClient();
  const contactsQuery = useQuery({
    queryKey: ['contactChoices', userId],
    queryFn: fetchContactChoices,
    enabled: (type === 'contact' || type === 'followUp') && isPro && Boolean(userId),
  });
  const matchingContacts = (contactsQuery.data ?? []).filter((contact) =>
    contact.name.toLowerCase().includes(contactSearch.trim().toLowerCase()),
  ).slice(0, 8);

  function chooseDate(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === 'android') setPickerMode(null);
    if (event.type !== 'set' || !selectedDate) return;
    setEventDate((previous) => pickerMode === 'time'
      ? new Date(previous.getFullYear(), previous.getMonth(), previous.getDate(), selectedDate.getHours(), selectedDate.getMinutes())
      : new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), previous.getHours(), previous.getMinutes()));
  }

  async function save() {
    if (!title.trim() || !userId || savingRef.current || !Number.isFinite(eventDate.getTime()) || (mode === 'directory' && !contactId)) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      const date = type === 'event' ? eventDate : new Date();
      const entry = await createActivity({
        userId,
        type,
        title: title.trim(),
        contactId: mode === 'directory' && type !== 'event' ? contactId ?? undefined : undefined,
        notes: notes.trim() || undefined,
        date,
        weekKey: computeWeekKey(date),
      });
      queryClient.setQueryData<ActivityEntry[]>(activityQueryKey(userId), (current) => [entry, ...(current ?? [])]);
      navigation.popToTop();
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
        <AppText variant="title">Log {typeLabels[type]}</AppText>
        {(type === 'contact' || type === 'followUp') && isPro ? <View style={styles.modeRow}>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: mode === 'manual' }} onPress={() => { setMode('manual'); setContactId(null); setTitle(''); }} style={[styles.modeButton, mode === 'manual' && styles.modeActive]}><AppText variant="captionStrong">Manual name</AppText></Pressable>
          <Pressable accessibilityRole="tab" accessibilityState={{ selected: mode === 'directory' }} onPress={() => { setMode('directory'); setTitle(''); }} style={[styles.modeButton, mode === 'directory' && styles.modeActive]}><AppText variant="captionStrong">Directory contact</AppText></Pressable>
        </View> : null}
        {(type === 'contact' || type === 'followUp') && mode === 'directory' && isPro ? <View style={styles.choices}>
          <FormField label="FIND A CONTACT" placeholder="Search directory" value={contactSearch} onChangeText={setContactSearch} />
          {contactsQuery.isError ? <Pressable onPress={() => contactsQuery.refetch()}><AppText variant="caption" color={colors.danger}>Couldn&apos;t load contacts. Tap to retry.</AppText></Pressable> : null}
          {contactsQuery.isPending ? <AppText variant="caption" color={colors.textSecondary}>Loading contacts…</AppText> : null}
          {matchingContacts.map((contact) => <Pressable key={contact.id} accessibilityRole="button" accessibilityLabel={`Link ${contact.name}`} onPress={() => { setContactId(contact.id); setTitle(type === 'followUp' ? `Follow up with ${contact.name}` : contact.name); }} style={[styles.contactChoice, contactId === contact.id && styles.choiceSelected]}><AppText variant="bodyStrong">{contact.name}</AppText><AppText variant="caption" color={colors.textSecondary}>{contact.categorySlug}</AppText></Pressable>)}
          {contactsQuery.isSuccess && matchingContacts.length === 0 ? <AppText variant="caption" color={colors.textSecondary}>No matching contacts. Use a manual name instead.</AppText> : null}
        </View> : null}
        <FormField
          label={type === 'event' ? 'EVENT NAME' : 'NAME'}
          placeholder={type === 'event' ? 'e.g. Industry mixer' : 'e.g. Jane Doe'}
          value={title}
          onChangeText={setTitle}
          editable={mode === 'manual' || type === 'event'}
        />
        {type === 'event' ? <View style={styles.dateWrap}>
          <AppText variant="captionStrong" color={colors.textSecondary}>EVENT DATE</AppText>
          <Pressable accessibilityRole="button" accessibilityLabel="Choose event date" onPress={() => setPickerMode('date')} style={styles.dateButton}><AppText variant="body">{eventDate.toLocaleDateString()}</AppText></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Choose event time" onPress={() => setPickerMode('time')} style={styles.dateButton}><AppText variant="body">{eventDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</AppText></Pressable>
          {pickerMode ? <>
            <DateTimePicker testID="event-date-picker" value={eventDate} mode={pickerMode} display={Platform.OS === 'ios' && pickerMode === 'date' ? 'inline' : 'default'} onChange={chooseDate} maximumDate={pickerMode === 'date' ? new Date() : undefined} />
            {Platform.OS === 'ios' ? <Pressable accessibilityRole="button" accessibilityLabel="Done choosing date or time" onPress={() => setPickerMode(null)}><AppText variant="captionStrong" color={colors.accentLime}>Done</AppText></Pressable> : null}
          </> : null}
        </View> : null}
        <FormField
          label="NOTES (OPTIONAL)"
          placeholder="Anything worth remembering"
          value={notes}
          onChangeText={setNotes}
          multiline
        />
        <Button label={saving ? 'Saving…' : 'Save'} onPress={save} disabled={!title.trim() || !userId || saving || (mode === 'directory' && !contactId)} />
        {saveError ? <AppText variant="caption" color={colors.danger}>Couldn't save this activity. Please try again.</AppText> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { paddingTop: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeButton: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  modeActive: { backgroundColor: colors.accentFaint, borderColor: colors.accentLime },
  choices: { gap: spacing.xs },
  contactChoice: { padding: spacing.sm, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  choiceSelected: { borderColor: colors.accentLime, backgroundColor: colors.accentFaint },
  dateWrap: { gap: spacing.xs },
  dateButton: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 10, padding: spacing.md },
});
