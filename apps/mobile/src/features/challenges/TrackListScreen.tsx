import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Card, EmptyState, IconTile, Screen } from '../../components';
import { colors, spacing, trackIcons, type GradientToken } from '../../theme';
import { useChallenges, useTracks } from '../../hooks/useContent';
import { useAuthStore } from '../../store/useAuthStore';
import { useChallengeProgress } from '../../hooks/useChallengeProgress';
import { useAppStore } from '../../store/useAppStore';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackList'>;

export function TrackListScreen({ navigation }: Props) {
  const selectedSlugs = useAuthStore((s) => s.selectedTrackSlugs) ?? [];
  const progressQuery = useChallengeProgress();
  const tracksQuery = useTracks();
  const challengesQuery = useChallenges();
  const tracks = tracksQuery.data ?? [];
  const progress = progressQuery.data ?? {};
  const isPro = useAppStore((state) => state.isPro);
  const [tab, setTab] = useState<'mine' | 'all'>('mine');
  const tones: GradientToken[] = ['barOrange', 'green', 'brand', 'barLime', 'ember', 'barAmber'];

  const sorted = (tab === 'mine' ? tracks.filter((track) => selectedSlugs.includes(track.slug)) : [...tracks]).sort((a, b) => {
    const aSelected = selectedSlugs.includes(a.slug);
    const bSelected = selectedSlugs.includes(b.slug);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    return a.order - b.order;
  });

  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>Challenges</AppText>
      <View style={styles.tabs}>
        <Pressable onPress={() => setTab('mine')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'mine' }}><AppText variant={tab === 'mine' ? 'bodyStrong' : 'body'} color={tab === 'mine' ? colors.textPrimary : colors.textSecondary}>My Tracks</AppText></Pressable>
        <Pressable onPress={() => setTab('all')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'all' }}><AppText variant={tab === 'all' ? 'bodyStrong' : 'body'} color={tab === 'all' ? colors.textPrimary : colors.textSecondary}>All Tracks</AppText></Pressable>
      </View>
      {progressQuery.isError ? <Pressable onPress={() => progressQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load challenge progress. Tap to retry.</AppText></Pressable> : null}
      {tracksQuery.isError ? <Pressable onPress={() => tracksQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load tracks. Tap to retry.</AppText></Pressable> : null}
      {challengesQuery.isError ? <Pressable onPress={() => challengesQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load challenge counts. Tap to retry.</AppText></Pressable> : null}
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={tracksQuery.isPending ? <AppText variant="caption">Loading tracks…</AppText> : <EmptyState icon="trophy-outline" title="No tracks selected" description="Choose tracks in Profile, or view All Tracks." />}
        renderItem={({ item }) => {
          const challenges = (challengesQuery.data ?? []).filter((challenge) => challenge.trackSlug === item.slug);
          const total = challenges.length;
          const done = challenges.filter((challenge) => progress[challenge.id]?.status === 'complete').length;
          return (
            <Pressable onPress={() => navigation.navigate('TrackDetail', { trackSlug: item.slug })}>
              <Card style={styles.row} elevation="none">
                <IconTile icon={trackIcons[item.slug] ?? 'star-outline'} tone={tones[Math.abs(item.order) % tones.length]} size="md" />
                <View style={styles.text}><AppText variant="bodyStrong">{item.name}</AppText><AppText variant="caption" color={colors.textSecondary}>{!isPro ? 'Premium track' : challengesQuery.isPending ? 'Loading progress…' : `${done}/${total} completed`}</AppText></View>
                <AppText variant="title" color={colors.textSecondary}>›</AppText>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.sm },
  tabs: { flexDirection: 'row', gap: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginBottom: spacing.sm },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
