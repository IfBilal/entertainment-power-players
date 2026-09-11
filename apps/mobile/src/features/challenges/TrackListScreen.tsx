import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { tracks, trackCompletionCount } from '../../services/mock/challenges';
import { useAppStore } from '../../store/useAppStore';
import { useChallengesStore } from '../../store/useChallengesStore';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'TrackList'>;

export function TrackListScreen({ navigation }: Props) {
  const selectedSlugs = useAppStore((s) => s.selectedTrackSlugs);
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
      <FlatList
        data={sorted}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const { done, total } = trackCompletionCount(item, progress);
          const isSelected = selectedSlugs.includes(item.slug);
          return (
            <Pressable onPress={() => navigation.navigate('TrackDetail', { trackSlug: item.slug })}>
              <Card style={styles.row}>
                <View>
                  <AppText variant="bodyStrong">{item.name}</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>{done} of {total} complete</AppText>
                </View>
                <View style={styles.rightRow}>
                  {isSelected ? <Ionicons name="star" size={16} color={colors.accent} style={styles.pin} /> : null}
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
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
  heading: { marginBottom: spacing.md },
  list: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rightRow: { flexDirection: 'row', alignItems: 'center' },
  pin: { marginRight: spacing.xs },
});
