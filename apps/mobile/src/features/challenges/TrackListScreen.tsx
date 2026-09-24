import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, IconTile, ProgressRing, Screen } from '../../components';
import { colors, spacing, trackIcons } from '../../theme';
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
      <AppText variant="title" style={styles.heading}>Challenges</AppText>
      <View style={styles.tabs}><AppText variant="bodyStrong">My Tracks</AppText><AppText variant="body" color={colors.textSecondary}>All Tracks</AppText></View>
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
              <View style={styles.row}>
                <IconTile icon={trackIcons[item.slug]} size="md" soft />
                <View style={styles.text}><AppText variant="bodyStrong">{item.name}</AppText><AppText variant="caption" color={colors.textSecondary}>{done}/{total} completed</AppText></View>
              </View>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderSubtle },
  text: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
