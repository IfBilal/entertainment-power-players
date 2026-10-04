import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, CategoryGlyph, CounterControl, ProgressRing, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useChallenges, useTracks } from '../../hooks/useContent';
import { useChallengeActions } from '../../hooks/useChallengeActions';
import { useAppStore } from '../../store/useAppStore';
import type { ChallengeRecord } from '../../types/week3';
import type { ChallengesStackParamList } from '../../navigation/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'ChallengeDetail'>;

export function ChallengeDetailScreen({ route, navigation }: Props) {
  const { trackSlug, challengeId } = route.params;
  const tracksQuery = useTracks();
  const challengesQuery = useChallenges();
  const isPro = useAppStore((state) => state.isPro);
  const track = tracksQuery.data?.find((candidate) => candidate.slug === trackSlug);
  const foundChallenge = challengesQuery.data?.find((candidate) => candidate.trackSlug === trackSlug && candidate.id === challengeId);
  const challenge: ChallengeRecord = foundChallenge ?? {
    id: challengeId, trackSlug, order: -1,
    title: '', description: '', type: 'single', target: null, active: false,
  };
  const { progress: entry, disabled, error, act, saveNote } = useChallengeActions(challenge);
  const [note, setNote] = useState('');
  const complete = entry?.status === 'complete';
  const reduceMotion = useReducedMotion();
  const completionScale = useRef(new Animated.Value(1)).current;
  useEffect(() => setNote(entry?.note ?? ''), [entry?.note]);
  useEffect(() => {
    if (!complete || reduceMotion || process.env.NODE_ENV === 'test') return;
    const pulse = Animated.sequence([
      Animated.timing(completionScale, { toValue: 1.09, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(completionScale, { toValue: 1, speed: 12, bounciness: 7, useNativeDriver: true }),
    ]);
    pulse.start();
    return () => pulse.stop();
  }, [complete, completionScale, reduceMotion]);
  if (!isPro) return <Screen><AppText variant="title" style={styles.title}>Premium challenge</AppText><Button label="See plans" fullWidth onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'challenges' })} /></Screen>;
  if (tracksQuery.isPending || challengesQuery.isPending) return <Screen><AppText variant="body">Loading challenge…</AppText></Screen>;
  if (tracksQuery.isError || challengesQuery.isError) return <Screen><Button label="Retry loading challenge" onPress={() => { tracksQuery.refetch(); challengesQuery.refetch(); }} /></Screen>;
  if (!track || !foundChallenge) return <Screen><AppText variant="body">Challenge not found.</AppText></Screen>;
  const count = entry?.count ?? 0;
  const target = challenge.target ?? 1;

  function change(action: 'increment' | 'decrement') { act(action, note); }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back to track" hitSlop={10} style={styles.back}><Ionicons name="chevron-back" size={26} color={colors.textPrimary} /></Pressable>
          <AppText variant="label" color={colors.accent}>{track.name.toUpperCase()}</AppText>
          <View style={styles.back} />
        </View>
        <View style={styles.identity} accessibilityLabel={`Challenge category: ${track.name}`}>
          <CategoryGlyph slug={track.slug} size={30} color={colors.accent} />
        </View>
        <AppText variant="title" style={styles.title}>{challenge.title}</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.description}>{challenge.description}</AppText>
        <View style={styles.progress}>
          <Animated.View style={[styles.progressHalo, complete && styles.progressHaloComplete, { transform: [{ scale: completionScale }] }]}><ProgressRing progress={target ? count / target : Number(complete)} size={156} strokeWidth={12} label={`${challenge.type === 'counter' ? count : Number(complete)}/${target}`} /></Animated.View>
          <View style={[styles.statusBadge, complete && styles.statusBadgeComplete]}><Ionicons name={complete ? 'checkmark-circle' : 'flash-outline'} size={17} color={complete ? colors.success : colors.accent} /><AppText variant="bodyStrong" color={complete ? colors.success : colors.accent}>{complete ? 'Completed' : 'In progress'}</AppText></View>
        </View>
        {challenge.type === 'counter' ? <View style={styles.counter}><AppText variant="captionStrong" color={colors.accent} style={styles.counterLabel}>Target {target}</AppText><CounterControl count={count} target={target} onIncrement={() => change('increment')} onDecrement={() => change('decrement')} disabled={disabled} /></View> : null}
        <TextInput value={note} onChangeText={setNote} onBlur={() => { if (note !== (entry?.note ?? '')) saveNote(note); }} editable={!disabled} placeholder="Add Note" placeholderTextColor={colors.textMuted} style={styles.note} multiline />
        {error ? <AppText variant="caption" color={colors.danger} style={styles.error}>Couldn't save challenge. Try again.</AppText> : null}
        {challenge.type === 'single' ? <View style={styles.bottom}><Button label={complete ? 'Mark Incomplete' : 'Mark as Complete'} fullWidth onPress={() => act('toggle', note)} disabled={disabled} /></View> : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm },
  back: { width: 36, minHeight: 36, justifyContent: 'center' },
  identity: { width: 70, height: 70, borderRadius: 24, backgroundColor: colors.accentSoft, borderWidth: 3, borderColor: colors.surfaceStrong, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginTop: spacing.md },
  title: { marginTop: spacing.md, textAlign: 'center' },
  description: { marginTop: spacing.sm, textAlign: 'center' },
  progress: { alignItems: 'center', marginVertical: spacing.lg },
  progressHalo: { padding: 10, borderRadius: 90, backgroundColor: colors.accentFaint },
  progressHaloComplete: { backgroundColor: colors.successSoft },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, backgroundColor: colors.accentSoft },
  statusBadgeComplete: { backgroundColor: colors.successSoft },
  counter: { alignItems: 'center' },
  counterLabel: { marginBottom: spacing.sm },
  note: { marginTop: spacing.lg, minHeight: 72, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surfaceSubtle, padding: spacing.md, textAlignVertical: 'top' },
  error: { marginTop: spacing.sm, textAlign: 'center' },
  bottom: { marginTop: 'auto', paddingTop: spacing.xl },
});
