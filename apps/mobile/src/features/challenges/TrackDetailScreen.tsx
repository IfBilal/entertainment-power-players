import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Card, EmptyState, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { tracks, trackCompletionCount, type Challenge } from '../../services/mock/challenges';
import { useAppStore } from '../../store/useAppStore';
import { useChallengesStore } from '../../store/useChallengesStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import { isScreenLocked } from '../../utils/paywall';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackDetail'>;

function ChallengeRow({ trackSlug, challenge }: { trackSlug: string; challenge: Challenge }) {
  const key = `${trackSlug}_${challenge.order}`;
  const entry = useChallengesStore((s) => s.progress[key]);
  const act = useChallengesStore((s) => s.act);
  const addEntry = useTrackerStore((s) => s.addEntry);
  const [note, setNote] = useState('');

  const isComplete = entry?.status === 'complete';
  const count = entry?.count ?? 0;

  function afterComplete(nowComplete: boolean) {
    if (nowComplete) {
      addEntry({ type: 'challenge', title: `Completed "${challenge.title}"`, date: new Date(), notes: note || undefined });
    }
  }

  function onToggle() {
    act(trackSlug, challenge, 'toggle');
    afterComplete(!isComplete);
  }

  function onStep(action: 'increment' | 'decrement') {
    const wasComplete = isComplete;
    act(trackSlug, challenge, action);
    if (action === 'increment' && !wasComplete && count + 1 >= (challenge.target ?? 1)) {
      afterComplete(true);
    }
  }

  return (
    <Card style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeText}>
          <AppText variant="bodyStrong">{challenge.title}</AppText>
          <AppText variant="caption" color={colors.textSecondary}>{challenge.description}</AppText>
        </View>
        {challenge.type === 'single' ? (
          <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: isComplete }}>
            <Ionicons name={isComplete ? 'checkbox' : 'square-outline'} size={26} color={colors.accent} />
          </Pressable>
        ) : (
          <View style={styles.stepper}>
            <Pressable onPress={() => onStep('decrement')}>
              <Ionicons name="remove-circle-outline" size={24} color={colors.accent} />
            </Pressable>
            <AppText variant="bodyStrong">{count} of {challenge.target}</AppText>
            <Pressable onPress={() => onStep('increment')}>
              <Ionicons name="add-circle-outline" size={24} color={colors.accent} />
            </Pressable>
          </View>
        )}
      </View>
      <TextInput
        placeholder="Add a note (optional)"
        value={note}
        onChangeText={setNote}
        style={styles.noteInput}
        placeholderTextColor={colors.textSecondary}
      />
    </Card>
  );
}

export function TrackDetailScreen({ route, navigation }: Props) {
  const { trackSlug } = route.params;
  const track = tracks.find((t) => t.slug === trackSlug);
  const isPro = useAppStore((s) => s.isPro);
  const progress = useChallengesStore((s) => s.progress);

  if (!track) {
    return (
      <Screen>
        <AppText variant="body">Track not found.</AppText>
      </Screen>
    );
  }

  const locked = isScreenLocked('challengeTrackDetail', isPro);
  if (locked) {
    return (
      <Screen>
        <AppText variant="title" style={styles.heading}>{track.name}</AppText>
        <EmptyState icon="lock-closed-outline" title="Pro feature" description="Subscribe to unlock this track's challenges." />
        <Button label="See plans" onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'Paywall', params: { reason: 'challenges' } })} />
      </Screen>
    );
  }

  const { done, total } = trackCompletionCount(track, progress);

  return (
    <Screen>
      <AppText variant="title">{track.name}</AppText>
      <View style={styles.ring}>
        <View style={[styles.ringFill, { width: `${total > 0 ? (done / total) * 100 : 0}%` }]} />
      </View>
      <AppText variant="caption" color={colors.textSecondary} style={styles.ringLabel}>{done} of {total} complete</AppText>

      <FlatList
        data={track.challenges.sort((a, b) => a.order - b.order)}
        keyExtractor={(c) => String(c.order)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <ChallengeRow trackSlug={track.slug} challenge={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  ring: { height: 8, borderRadius: radius.pill, backgroundColor: colors.border, marginTop: spacing.md, overflow: 'hidden' },
  ringFill: { height: '100%', backgroundColor: colors.accent },
  ringLabel: { marginTop: spacing.xs, marginBottom: spacing.md },
  list: { gap: spacing.sm },
  challengeCard: { gap: spacing.sm },
  challengeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  challengeText: { flex: 1, marginRight: spacing.sm },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  noteInput: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    color: colors.textPrimary,
  },
});
