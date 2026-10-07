import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, ErrorState, Screen, SettingsRow, Skeleton } from '../../components';
import { colors, spacing } from '../../theme';
import { useQuestionProgress, useQuestions } from '../../hooks/useQuestions';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'QuestionList'>;

export function QuestionListScreen({ route, navigation }: Props) {
  const { categorySlug, group } = route.params;
  const questionsQuery = useQuestions();
  const progressQuery = useQuestionProgress();
  const progress = progressQuery.data ?? {};

  const inGroup = useMemo(
    () => (questionsQuery.data ?? []).filter((q) => q.categorySlug === categorySlug && q.challengeGroup === group),
    [questionsQuery.data, categorySlug, group],
  );
  const total = inGroup.length;

  return (
    <Screen padded={false}>
      <FlatList
        data={inGroup}
        keyExtractor={(q) => q.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="title" style={styles.heading}>{group}</AppText>
            {total > 0 ? <AppText variant="caption" color={colors.textSecondary} style={styles.subtitle}>{total} question{total === 1 ? '' : 's'}</AppText> : null}
          </View>
        }
        ListEmptyComponent={
          questionsQuery.isError ? (
            <ErrorState title="Couldn't load questions" onRetry={() => questionsQuery.refetch()} />
          ) : questionsQuery.isPending ? (
            <View style={styles.skeletons}>{[0, 1, 2].map((i) => <Skeleton key={i} height={56} radius={14} />)}</View>
          ) : null
        }
        renderItem={({ item }) => (
          <SettingsRow
            icon={progress[item.id]?.completedAt ? 'checkmark-circle' : 'ellipse-outline'}
            title={`${item.number}. ${item.question}`}
            onPress={() => navigation.navigate('QuestionDetail', { questionId: item.id })}
          />
        )}
      />
      {progressQuery.isError ? <Button label="Retry loading progress" variant="ghost" onPress={() => progressQuery.refetch()} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.md },
  heading: { textAlign: 'center' },
  subtitle: { marginTop: spacing.xs },
  list: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  skeletons: { gap: spacing.sm },
});
