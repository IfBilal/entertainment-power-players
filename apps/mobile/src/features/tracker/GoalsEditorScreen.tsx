import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
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
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        One number per activity type — carries forward to next week unless you change it.
      </AppText>
      <View style={styles.form}>
        <FormField label="CONTACTS" value={contacts} onChangeText={setContacts} keyboardType="number-pad" />
        <FormField label="EVENTS" value={events} onChangeText={setEvents} keyboardType="number-pad" />
        <FormField label="FOLLOW-UPS" value={followUps} onChangeText={setFollowUps} keyboardType="number-pad" />
        <Button label="Save goals" onPress={save} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs },
  form: { marginTop: spacing.lg, gap: spacing.md },
});
