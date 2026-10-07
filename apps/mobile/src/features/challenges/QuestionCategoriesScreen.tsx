import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, CategoryGlyph, EmptyState, ErrorState, PaywallCard, Screen, Skeleton } from '../../components';
import { categoryPalette, colors, neutralCategoryPalette, spacing } from '../../theme';
import { fetchCategories } from '../../services/supabase/directory';
import { useQuestions } from '../../hooks/useQuestions';
import { useAppStore } from '../../store/useAppStore';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'QuestionCategories'>;

export function QuestionCategoriesScreen({ navigation }: Props) {
  const isPro = useAppStore((state) => state.isPro);
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const questionsQuery = useQuestions();

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const q of questionsQuery.data ?? []) result[q.categorySlug] = (result[q.categorySlug] ?? 0) + 1;
    return result;
  }, [questionsQuery.data]);

  if (!isPro) {
    return (
      <Screen>
        <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>KNOW YOUR INDUSTRY</AppText>
        <AppText variant="display" style={styles.heading}>Questions</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.lockedCopy}>Unlock bite-size industry knowledge, organized by category.</AppText>
        <View style={styles.benefits}>
          <PaywallCard icon="help-circle-outline" text="Questions across all five industries" />
          <PaywallCard icon="checkmark-done-outline" text="Track what you've learned" />
        </View>
        <Button label="See plans" fullWidth onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'challenges' })} />
      </Screen>
    );
  }

  const categories = categoriesQuery.data ?? [];

  return (
    <Screen padded={false}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.slug}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>KNOW YOUR INDUSTRY</AppText>
            <AppText variant="display" style={styles.heading}>Questions</AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>Pick a category to start.</AppText>
          </View>
        }
        ListEmptyComponent={
          categoriesQuery.isError || questionsQuery.isError ? (
            <ErrorState title="Couldn't load questions" description="Check your connection and try again." onRetry={() => { categoriesQuery.refetch(); questionsQuery.refetch(); }} />
          ) : categoriesQuery.isPending || questionsQuery.isPending ? (
            <View style={styles.skeletons}>{[0, 1, 2].map((i) => <Skeleton key={i} height={72} radius={16} />)}</View>
          ) : (
            <EmptyState icon="help-circle-outline" title="No questions yet" description="Check back soon -- new questions are on the way." />
          )
        }
        renderItem={({ item }) => {
          const palette = categoryPalette[item.slug] ?? neutralCategoryPalette;
          const count = counts[item.slug] ?? 0;
          return (
            <Pressable
              disabled={count === 0}
              onPress={() => navigation.navigate('QuestionGroups', { categorySlug: item.slug })}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}: ${count} question${count === 1 ? '' : 's'}`}
              style={[styles.row, { opacity: count > 0 ? 1 : 0.55 }]}
            >
              <View style={[styles.glyph, { backgroundColor: palette.fill }]}>
                <CategoryGlyph slug={item.slug} size={22} color={palette.glyph} />
              </View>
              <View style={styles.text}>
                <AppText variant="subtitle">{item.name}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>{count > 0 ? `${count} question${count === 1 ? '' : 's'}` : 'Coming soon'}</AppText>
              </View>
              {count > 0 ? <AppText variant="title" color={palette.glyph}>{'›'}</AppText> : null}
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  eyebrow: { textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  heading: { textAlign: 'center' },
  subtitle: { textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.lg },
  lockedCopy: { textAlign: 'center', marginHorizontal: spacing.md, marginTop: spacing.sm },
  benefits: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  list: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  skeletons: { gap: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  glyph: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
