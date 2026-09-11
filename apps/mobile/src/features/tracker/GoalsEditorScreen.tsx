import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useTrackerStore } from '../../store/useTrackerStore';
import { computeWeekKey } from '../../utils/weekKey';
import type { TrackerStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<TrackerStackParamList, 'GoalsEditor'>;

export function GoalsEditorScreen({ navigation }: Props) {
  const weekKey = computeWeekKey(new Date());
  const goalsForWeek = useTrackerStore((s) => s.goalsForWeek);
  const setGoalsForWeek = useTrackerStore((s) => s.setGoalsForWeek);
  const current = goalsForWeek(weekKey);
  const [contacts, setContacts] = useState(String(current.contacts));
  const [events, setEvents] = useState(String(current.events));
  const [followUps, setFollowUps] = useState(String(current.followUps));

  function save() {
    setGoalsForWeek(weekKey, {
      contacts: Number(contacts) || 0,
      events: Number(events) || 0,
      followUps: Number(followUps) || 0,
    });
    navigation.goBack();
  }

  return (
    <Screen>
      <AppText variant="title">Weekly goals</AppText>
      <View style={styles.form}>
        <AppText variant="label" color={colors.textSecondary}>CONTACTS</AppText>
        <TextInput value={contacts} onChangeText={setContacts} keyboardType="number-pad" style={styles.input} />
        <AppText variant="label" color={colors.textSecondary}>EVENTS</AppText>
        <TextInput value={events} onChangeText={setEvents} keyboardType="number-pad" style={styles.input} />
        <AppText variant="label" color={colors.textSecondary}>FOLLOW-UPS</AppText>
        <TextInput value={followUps} onChangeText={setFollowUps} keyboardType="number-pad" style={styles.input} />
        <Button label="Save goals" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { marginTop: spacing.lg, gap: spacing.xs },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
});
