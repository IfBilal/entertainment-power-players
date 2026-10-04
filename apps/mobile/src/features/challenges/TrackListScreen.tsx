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
  const palettes: Record<string, { fill: string; glyph: string }> = {
    fashion: { fill: '#FFF2E8', glyph: '#A94812' },
    'film-tv': { fill: '#EAF5EE', glyph: '#216B36' },
    gaming: { fill: '#EEF6E9', glyph: '#337326' },
    music: { fill: '#FFF6E6', glyph: '#8F5B00' },
    sports: { fill: '#E8F4F4', glyph: '#196A73' },
  };

  const sorted = (tab === 'mine' ? tracks.filter((track) => selectedSlugs.includes(track.slug)) : [...tracks]).sort((a, b) => {
    const aSelected = selectedSlugs.includes(a.slug);
    const bSelected = selectedSlugs.includes(b.slug);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    return a.order - b.order;
  });

  return (
    <Screen>
      <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>GROW WITH PURPOSE</AppText>
      <AppText variant="display" style={styles.heading}>Challenges</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>Small steps. Bigger opportunities.</AppText>
      <View style={styles.tabs}>
        <Pressable style={[styles.tab, tab === 'mine' && styles.activeTab]} onPress={() => setTab('mine')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'mine' }}><AppText variant="bodyStrong" color={tab === 'mine' ? colors.textInverse : colors.textSecondary}>My Tracks</AppText></Pressable>
        <Pressable style={[styles.tab, tab === 'all' && styles.activeTab]} onPress={() => setTab('all')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'all' }}><AppText variant="bodyStrong" color={tab === 'all' ? colors.textInverse : colors.textSecondary}>All Tracks</AppText></Pressable>
      </View>
      {progressQuery.isError ? <Pressable onPress={() => progressQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load challenge progress. Tap to retry.</AppText></Pressable> : null}
      {tracksQuery.isError ? <Pressable onPress={() => tracksQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load tracks. Tap to retry.</AppText></Pressable> : null}
      {challengesQuery.isError ? <Pressable onPress={() => challengesQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load challenge counts. Tap to retry.</AppText></Pressable> : null}
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={tracksQuery.isPending ? <AppText variant="caption">Loading tracks…</AppText> : <EmptyState icon="shapes-outline" title="No tracks selected" description="Choose tracks in Profile, or view All Tracks." />}
        renderItem={({ item }) => {
          const challenges = (challengesQuery.data ?? []).filter((challenge) => challenge.trackSlug === item.slug);
          const total = challenges.length;
          const done = challenges.filter((challenge) => progress[challenge.id]?.status === 'complete').length;
          const palette = palettes[item.slug] ?? { fill: colors.accentSoft, glyph: colors.accent };
          return (
            <Pressable onPress={() => navigation.navigate('TrackDetail', { trackSlug: item.slug })} accessibilityRole="button" accessibilityLabel={"Open " + item.name + " track"}>
              <Card style={styles.row} elevation="none">
                <View style={styles.rowTop}>
                  <IconTile icon={trackIcons[item.slug] ?? 'star-outline'} categorySlug={item.slug} tone={tones[Math.abs(item.order) % tones.length]} size="lg" circle fillColor={palette.fill} glyphColor={palette.glyph} />
                  <View style={styles.text}><AppText variant="subtitle">{item.name}</AppText><AppText variant="caption" color={colors.textSecondary}>{!isPro ? 'Premium track' : challengesQuery.isPending ? 'Loading progress…' : done + '/' + total + ' completed'}</AppText></View>
                  <AppText variant="title" color={palette.glyph}>›</AppText>
                </View>
                {isPro && total > 0 ? <View accessibilityRole="progressbar" accessibilityLabel={item.name + ': ' + done + ' of ' + total + ' challenges complete'} accessibilityValue={{ min: 0, max: total, now: done }} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(100, done / total * 100)}%` as const, backgroundColor: palette.glyph }]} /></View> : null}
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  heading: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', alignSelf: 'center', gap: spacing.xs, backgroundColor: colors.surfaceSubtle, borderRadius: 18, padding: spacing.xs, marginBottom: spacing.lg },
  tab: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 14 },
  activeTab: { backgroundColor: colors.accent },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: { gap: spacing.md, borderColor: colors.border },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
  progressTrack: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceStrong, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
});
