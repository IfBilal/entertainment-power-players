import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, CounterControl, ProgressRing, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { applyChallengeAction, tracks } from '../../services/mock/challenges';
import { useChallengesStore } from '../../store/useChallengesStore';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'ChallengeDetail'>;

export function ChallengeDetailScreen({ route, navigation }: Props) {
  const { trackSlug, challengeOrder } = route.params;
  const track = tracks.find((candidate) => candidate.slug === trackSlug);
  const foundChallenge = track?.challenges.find((candidate) => candidate.order === challengeOrder);
  const key = `${trackSlug}_${challengeOrder}`;
  const entry = useChallengesStore((state) => state.progress[key]);
  const act = useChallengesStore((state) => state.act);
  const [note, setNote] = useState('');
  if (!track || !foundChallenge) return <Screen><AppText variant="body">Challenge not found.</AppText></Screen>;
  const challenge = foundChallenge;
  const count = entry?.count ?? 0;
  const target = challenge.target ?? 1;
  const complete = entry?.status === 'complete';

  function change(action: 'increment' | 'decrement') { act(trackSlug, challenge, action); }
  function markComplete() {
    if (challenge.type === 'counter') while ((useChallengesStore.getState().progress[key]?.count ?? 0) < target) act(trackSlug, challenge, 'increment');
    else act(trackSlug, challenge, 'toggle');
  }

  return (
    <Screen>
      <View style={styles.top}><Pressable onPress={() => navigation.goBack()} hitSlop={10}><Ionicons name="chevron-back" size={26} color={colors.textPrimary} /></Pressable><AppText variant="label" color={colors.accentAmber}>{track.name.toUpperCase()}</AppText><View style={{ width: 26 }} /></View>
      <AppText variant="title" style={styles.title}>{challenge.title}</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.description}>{challenge.description}</AppText>
      <View style={styles.progress}><ProgressRing progress={target ? count / target : Number(complete)} size={156} strokeWidth={12} label={`${challenge.type === 'counter' ? count : Number(complete)}/${target}`} /><AppText variant="caption" color={colors.textSecondary} style={styles.completed}>Completed</AppText></View>
      {challenge.type === 'counter' ? <><AppText variant="captionStrong" color={colors.accentAmber} style={styles.counterLabel}>Counter · Target {target}</AppText><CounterControl count={count} target={target} onIncrement={() => change('increment')} onDecrement={() => change('decrement')} /></> : null}
      <TextInput value={note} onChangeText={setNote} placeholder="Add Note" placeholderTextColor={colors.textMuted} style={styles.note} />
      <View style={styles.bottom}><Button label={complete ? 'Completed' : 'Mark as Complete'} onPress={markComplete} disabled={complete} /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({ top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { marginTop: spacing.lg }, description: { marginTop: spacing.sm }, progress: { alignItems: 'center', marginVertical: spacing.lg }, completed: { marginTop: -52 }, counterLabel: { marginBottom: spacing.sm }, note: { marginTop: spacing.lg, color: colors.textPrimary, borderBottomWidth: 1, borderColor: colors.borderStrong, paddingVertical: spacing.md }, bottom: { flex: 1, justifyContent: 'flex-end', paddingBottom: spacing.sm } });
