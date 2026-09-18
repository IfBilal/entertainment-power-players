import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, ChallengeRow, EmptyState, PaywallCard, ProgressRing, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { applyChallengeAction, tracks, trackCompletionCount, type Challenge } from '../../services/mock/challenges';
import { useAppStore } from '../../store/useAppStore';
import { useChallengesStore } from '../../store/useChallengesStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import { isScreenLocked } from '../../utils/paywall';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackDetail'>;

function ConnectedChallengeRow({ trackSlug, challenge }: { trackSlug: string; challenge: Challenge }) {
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
    const next = applyChallengeAction(challenge, entry, 'toggle');
    act(trackSlug, challenge, 'toggle');
    afterComplete(next.status === 'complete' && !isComplete);
  }

  function onStep(action: 'increment' | 'decrement') {
    const wasComplete = isComplete;
    act(trackSlug, challenge, action);
    if (action === 'increment' && !wasComplete && count + 1 >= (challenge.target ?? 1)) {
      afterComplete(true);
    }
  }

  return (
    <ChallengeRow
      title={challenge.title}
      description={challenge.description}
      type={challenge.type}
      isComplete={isComplete}
      count={count}
      target={challenge.target}
      note={note}
      onToggle={onToggle}
      onIncrement={() => onStep('increment')}
      onDecrement={() => onStep('decrement')}
      onNoteChange={setNote}
    />
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
        <View style={styles.benefits}>
          <PaywallCard icon="trophy-outline" text="All challenges in this track" />
          <PaywallCard icon="stats-chart-outline" text="Progress tracked toward your weekly goals" />
        </View>
        <Button label="See plans" onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'challenges' })} />
      </Screen>
    );
  }

  const { done, total } = trackCompletionCount(track, progress);
  const complete = total > 0 && done === total;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="label" color={colors.textTertiary}>TRACK</AppText>
          <AppText variant="title">{track.name}</AppText>
          <AppText variant="caption" color={complete ? colors.success : colors.textSecondary} style={styles.ringLabel}>
            {complete ? 'Track complete' : `${done} of ${total} complete`}
          </AppText>
        </View>
        <ProgressRing progress={total > 0 ? done / total : 0} label={`${done}/${total}`} />
      </View>

      {complete ? (
        <AppText variant="subtitle" style={styles.celebration}>You&apos;ve finished this path. Keep building.</AppText>
      ) : (
        <AppText variant="subtitle" style={styles.celebration}>Keep the momentum going.</AppText>
      )}

      <FlatList
        data={[...track.challenges].sort((a, b) => a.order - b.order)}
        keyExtractor={(c) => String(c.order)}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="checkmark-done-outline" title="No challenges yet" />}
        renderItem={({ item }) => <ConnectedChallengeRow trackSlug={track.slug} challenge={item} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  benefits: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { flex: 1, marginRight: spacing.md },
  ringLabel: { marginTop: spacing.xs },
  celebration: { marginTop: spacing.md, marginBottom: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
});
