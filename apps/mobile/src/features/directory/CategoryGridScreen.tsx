import { FlatList, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AppText, CategoryCard, ErrorState, Screen, Skeleton } from '../../components';
import { colors, spacing, type IoniconName } from '../../theme';
import { fetchCategories, fetchCategoryCounts } from '../../services/supabase/directory';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'CategoryGrid'>;

export function CategoryGridScreen({ navigation }: Props) {
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const countsQuery = useQuery({ queryKey: ['categoryCounts'], queryFn: fetchCategoryCounts });

  const categories = categoriesQuery.data ?? [];
  const counts = countsQuery.data ?? {};
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return (
    <Screen padded={false}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        refreshing={categoriesQuery.isFetching}
        onRefresh={() => {
          categoriesQuery.refetch();
          countsQuery.refetch();
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppText variant="label" color={colors.textTertiary}>
              YOUR INDUSTRY
            </AppText>
            <AppText variant="display" style={styles.heading}>
              People worth knowing.
            </AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.subheading}>
              Explore the people shaping entertainment
              {total > 0 ? ` — ${total}+ industry contacts` : ''}.
            </AppText>
          </View>
        }
        ListEmptyComponent={
          categoriesQuery.isError ? (
            <ErrorState
              title="Couldn't load categories"
              description="Check your connection and pull to try again."
              onRetry={() => categoriesQuery.refetch()}
            />
          ) : categoriesQuery.isLoading ? (
            <View style={styles.skeletonGrid}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} height={132} radius={18} style={styles.skeletonCard} />
              ))}
            </View>
          ) : (
            <AppText variant="body" color={colors.textSecondary} style={styles.empty}>
              No categories yet.
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.cell}>
            <CategoryCard
              name={item.name}
              icon={item.icon as IoniconName}
              count={counts[item.slug]}
              onPress={() => navigation.navigate('ContactList', { categorySlug: item.slug })}
            />
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  heading: {
    marginTop: spacing.xs,
  },
  subheading: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  grid: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  row: { gap: spacing.sm },
  cell: { flex: 1 },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skeletonCard: { flexBasis: '48%', flexGrow: 1 },
  empty: { paddingHorizontal: spacing.md, paddingVertical: spacing.xl, textAlign: 'center' },
});
