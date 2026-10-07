import { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, CategoryGlyph, EmptyState, ErrorState, Screen, SettingsRow, Skeleton } from '../../components';
import { categoryPalette, colors, neutralCategoryPalette, spacing } from '../../theme';
import { fetchCategories } from '../../services/supabase/directory';
import { useQuestionProgress, useQuestions } from '../../hooks/useQuestions';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'QuestionGroups'>;

export function QuestionGroupsScreen({ route, navigation }: Props) {
  const { categorySlug } = route.params;
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const questionsQuery = useQuestions();
  const progressQuery = useQuestionProgress();

  const category = categoriesQuery.data?.find((c) => c.slug === categorySlug);
  const inCategory = useMemo(
    () => (questionsQuery.data ?? []).filter((q) => q.categorySlug === categorySlug),
    [questionsQuery.data, categorySlug],
  );
  const groups = useMemo(() => {
    const seen: string[] = [];
    for (const q of inCategory) if (!seen.includes(q.challengeGroup)) seen.push(q.challengeGroup);
    const progress = progressQuery.data ?? {};
    return seen.map((group) => {
      const questions = inCategory.filter((q) => q.challengeGroup === group);
      const done = questions.filter((q) => progress[q.id]?.completedAt).length;
      return { group, total: questions.length, done };
    });
  }, [inCategory, progressQuery.data]);

  const palette = categoryPalette[categorySlug] ?? neutralCategoryPalette;

  return (
    <Screen padded={false}>
      <FlatList
        data={groups}
        keyExtractor={(g) => g.group}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={[styles.glyph, { backgroundColor: palette.fill }]}>
              <CategoryGlyph slug={categorySlug} size={28} color={palette.glyph} />
            </View>
            <AppText variant="title" style={styles.heading}>{category?.name ?? categorySlug}</AppText>
          </View>
        }
        ListEmptyComponent={
          questionsQuery.isError ? (
            <ErrorState title="Couldn't load questions" onRetry={() => questionsQuery.refetch()} />
          ) : questionsQuery.isPending ? (
            <View style={styles.skeletons}>{[0, 1].map((i) => <Skeleton key={i} height={64} radius={14} />)}</View>
          ) : (
            <EmptyState icon="help-circle-outline" title="No questions yet" description="Check back soon for this category." />
          )
        }
        renderItem={({ item }) => (
          <SettingsRow
            icon="layers-outline"
            title={item.group}
            subtitle={`${item.done}/${item.total} complete`}
            onPress={() => navigation.navigate('QuestionList', { categorySlug, group: item.group })}
          />
        )}
      />
      {progressQuery.isError ? <Button label="Retry loading progress" variant="ghost" onPress={() => progressQuery.refetch()} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingTop: spacing.sm, paddingBottom: spacing.md },
  glyph: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  heading: { textAlign: 'center' },
  list: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  skeletons: { gap: spacing.sm },
});
