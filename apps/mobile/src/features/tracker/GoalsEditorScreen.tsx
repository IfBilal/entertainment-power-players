import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useAuthStore } from '../../store/useAuthStore';
import { useUserGoals } from '../../hooks/useUserGoals';
import { goalsForWeek, goalsQueryKey, saveWeeklyGoals, type GoalsByWeek } from '../../services/supabase/goals';
import { computeWeekKey } from '../../utils/weekKey';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'GoalsEditor'>;

export function GoalsEditorScreen({ navigation }: Props) {
  const [weekKey] = useState(() => computeWeekKey(new Date()));
  const userId = useAuthStore((state) => state.userId);
  const goalsQuery = useUserGoals();
  const queryClient = useQueryClient();
  const current = goalsForWeek(goalsQuery.data ?? {}, weekKey);
  const [contacts, setContacts] = useState(String(current.contacts));
  const [events, setEvents] = useState(String(current.events));
  const [followUps, setFollowUps] = useState(String(current.followUps));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const loadedInitialGoals = useRef(false);

  useEffect(() => {
    if (!goalsQuery.data || loadedInitialGoals.current) return;
    loadedInitialGoals.current = true;
    const latest = goalsForWeek(goalsQuery.data, weekKey);
    setContacts(String(latest.contacts));
    setEvents(String(latest.events));
    setFollowUps(String(latest.followUps));
  }, [goalsQuery.data, weekKey]);

  async function save() {
    if (!userId || saving || goalsQuery.isPending) return;
    const values = [contacts, events, followUps].map((value) => Number(value));
    if (values.some((value) => !Number.isInteger(value) || value < 0)) {
      setSaveError(true);
      return;
    }
    setSaving(true);
    setSaveError(false);
    const next = { contacts: values[0], events: values[1], followUps: values[2] };
    try {
      await saveWeeklyGoals(userId, weekKey, next);
      queryClient.setQueryData<GoalsByWeek>(goalsQueryKey(userId), (previous) => ({ ...previous, [weekKey]: next }));
      navigation.goBack();
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>Weekly goals</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        One number per activity type — carries forward to next week unless you change it.
      </AppText>
      <View style={styles.form}>
        <FormField label="CONTACTS" value={contacts} onChangeText={setContacts} keyboardType="number-pad" editable={!goalsQuery.isPending && !goalsQuery.isError} />
        <FormField label="EVENTS" value={events} onChangeText={setEvents} keyboardType="number-pad" editable={!goalsQuery.isPending && !goalsQuery.isError} />
        <FormField label="FOLLOW-UPS" value={followUps} onChangeText={setFollowUps} keyboardType="number-pad" editable={!goalsQuery.isPending && !goalsQuery.isError} />
        <Button label={saving ? 'Saving…' : 'Save goals'} size="lg" fullWidth onPress={save} disabled={!userId || goalsQuery.isPending || goalsQuery.isError || saving} />
        {goalsQuery.isError ? (
          <Pressable onPress={() => goalsQuery.refetch()} accessibilityRole="button" accessibilityLabel="Retry loading goals">
            <AppText variant="caption" color={colors.danger}>Couldn't load goals. Tap to retry.</AppText>
          </Pressable>
        ) : null}
        {saveError ? <AppText variant="caption" color={colors.danger}>Couldn't save goals. Enter non-negative whole numbers and try again.</AppText> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { textAlign: 'center' },
  subtitle: { marginTop: spacing.xs, textAlign: 'center' },
  form: { marginTop: spacing.lg, gap: spacing.md },
});
