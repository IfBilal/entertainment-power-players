import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Card, ProgressRing, Screen, Tag } from '../../components';
import { colors, spacing } from '../../theme';
import { tracks, trackCompletionCount } from '../../services/mock/challenges';
import { useAuthStore } from '../../store/useAuthStore';
import { useChallengesStore } from '../../store/useChallengesStore';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackList'>;

export function TrackListScreen({ navigation }: Props) {
  const selectedSlugs = useAuthStore((s) => s.selectedTrackSlugs) ?? [];
  const progress = useChallengesStore((s) => s.progress);

  const sorted = [...tracks].sort((a, b) => {
    const aSelected = selectedSlugs.includes(a.slug);
    const bSelected = selectedSlugs.includes(b.slug);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    return a.order - b.order;
  });

  return (
    <Screen>
      <AppText variant="label" color={colors.textTertiary}>YOUR PATH</AppText>
      <AppText variant="display" style={styles.heading}>Build your career, one move at a time.</AppText>
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const { done, total } = trackCompletionCount(item, progress);
          const isSelected = selectedSlugs.includes(item.slug);
          const pct = total > 0 ? done / total : 0;
          return (
            <Pressable onPress={() => navigation.navigate('TrackDetail', { trackSlug: item.slug })}>
              <Card style={styles.row}>
                <ProgressRing progress={pct} size={56} strokeWidth={5} label={`${Math.round(pct * 100)}%`} />
                <View style={styles.text}>
                  <View style={styles.titleRow}>
                    <AppText variant="bodyStrong">{item.name}</AppText>
                    {isSelected ? <Tag label="SELECTED" tone="accent" /> : null}
                  </View>
                  <AppText variant="caption" color={colors.textSecondary}>{done} of {total} complete</AppText>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.xs, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  text: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
