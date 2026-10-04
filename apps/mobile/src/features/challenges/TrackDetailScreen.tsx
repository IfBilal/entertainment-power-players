import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, CategoryGlyph, ChallengeRow, EmptyState, PaywallCard, ProgressRing, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useChallenges, useTracks } from '../../hooks/useContent';
import type { ChallengeRecord } from '../../types/week3';
import { useAppStore } from '../../store/useAppStore';
import { useChallengeActions } from '../../hooks/useChallengeActions';
import { useChallengeProgress } from '../../hooks/useChallengeProgress';
import { isScreenLocked } from '../../utils/paywall';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackDetail'>;

function ConnectedChallengeRow({ challenge, onOpen }: { challenge: ChallengeRecord; onOpen: () => void }) {
  const { progress: entry, disabled, error, act, saveNote } = useChallengeActions(challenge);
  const [note, setNote] = useState('');
  useEffect(() => setNote(entry?.note ?? ''), [entry?.note]);

  const isComplete = entry?.status === 'complete';
  const count = entry?.count ?? 0;

  return (
    <><ChallengeRow
      title={challenge.title}
      description={challenge.description}
      type={challenge.type}
      isComplete={isComplete}
      count={count}
      target={challenge.target ?? undefined}
      note={note}
      onToggle={() => act('toggle', note)}
      onIncrement={() => act('increment', note)}
      onDecrement={() => act('decrement', note)}
      onNoteChange={setNote}
      onNoteBlur={() => { if (note !== (entry?.note ?? '')) saveNote(note); }}
      disabled={disabled}
      onOpen={onOpen}
    />{error ? <AppText variant="caption" color={colors.danger}>Couldn't save challenge. Try again.</AppText> : null}</>
  );
}

export function TrackDetailScreen({ route, navigation }: Props) {
  const { trackSlug } = route.params;
  const tracksQuery = useTracks();
  const challengesQuery = useChallenges();
  const track = tracksQuery.data?.find((t) => t.slug === trackSlug);
  const challenges = (challengesQuery.data ?? []).filter((challenge) => challenge.trackSlug === trackSlug);
  const isPro = useAppStore((s) => s.isPro);
  const progressQuery = useChallengeProgress();
  const progress = progressQuery.data ?? {};

  if (tracksQuery.isPending) return <Screen><AppText variant="body">Loading track…</AppText></Screen>;
  if (tracksQuery.isError) return <Screen><Button label="Retry loading track" onPress={() => tracksQuery.refetch()} /></Screen>;
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
        <View style={styles.identity} accessibilityLabel={`${track.name} category`}>
          <CategoryGlyph slug={track.slug} size={34} color={colors.accent} />
        </View>
        <AppText variant="title" style={styles.heading}>{track.name}</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.lockedCopy}>See the challenges and track your progress with Premium.</AppText>
        <View style={styles.benefits}>
          <PaywallCard icon="checkmark-done-outline" text="All challenges in this track" />
          <PaywallCard icon="stats-chart-outline" text="Progress tracked toward your weekly goals" />
        </View>
        <Button label="See plans" fullWidth onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'challenges' })} />
      </Screen>
    );
  }

  const total = challenges.length;
  const done = challenges.filter((challenge) => progress[challenge.id]?.status === 'complete').length;
  const complete = total > 0 && done === total;

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.identity} accessibilityLabel={`${track.name} category`}>
          <CategoryGlyph slug={track.slug} size={34} color={colors.accent} />
        </View>
        <AppText variant="title" style={styles.heading}>{track.name}</AppText>
        <View style={styles.ringHalo}><ProgressRing progress={total > 0 ? done / total : 0} size={132} strokeWidth={11} label={`${done}/${total}`} /></View>
        <AppText variant="bodyStrong" color={complete ? colors.success : colors.textSecondary} style={styles.ringLabel}>
          {complete ? 'Track complete' : `${done} of ${total} complete`}
        </AppText>
      </View>

      {complete ? (
        <AppText variant="subtitle" style={styles.celebration}>You&apos;ve finished this path. Keep building.</AppText>
      ) : (
        <AppText variant="subtitle" style={styles.celebration}>Keep the momentum going.</AppText>
      )}
      {progressQuery.isError ? <Button label="Retry loading progress" variant="ghost" onPress={() => progressQuery.refetch()} /> : null}
      {challengesQuery.isError ? <Button label="Retry loading challenges" onPress={() => challengesQuery.refetch()} /> : null}

      <FlatList
        data={challenges}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState icon="checkmark-done-outline" title="No challenges yet" />}
        renderItem={({ item }) => <ConnectedChallengeRow challenge={item} onOpen={() => navigation.navigate('ChallengeDetail', { trackSlug: track.slug, challengeId: item.id })} />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md, textAlign: 'center' },
  identity: { width: 76, height: 76, borderRadius: 26, backgroundColor: colors.accentSoft, borderWidth: 3, borderColor: colors.surfaceStrong, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm, marginBottom: spacing.sm },
  ringHalo: { padding: 9, borderRadius: 84, backgroundColor: colors.accentFaint },
  lockedCopy: { textAlign: 'center', marginHorizontal: spacing.md },
  benefits: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  header: { alignItems: 'center' },
  ringLabel: { marginTop: spacing.sm, textAlign: 'center' },
  celebration: { marginTop: spacing.lg, marginBottom: spacing.md, textAlign: 'center' },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
});
