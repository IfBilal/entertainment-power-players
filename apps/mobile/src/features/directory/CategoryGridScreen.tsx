import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AppText, CategoryCard, ErrorState, Screen, Skeleton } from '../../components';
import { colors, spacing, type IoniconName } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchCategories, fetchCategoryCounts } from '../../services/supabase/directory';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'CategoryGrid'>;

export function CategoryGridScreen({ navigation }: Props) {
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const countsQuery = useQuery({ queryKey: ['categoryCounts'], queryFn: fetchCategoryCounts });

  const categories = categoriesQuery.data ?? [];
  const counts = countsQuery.data ?? {};
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const fills: Record<string, string> = { fashion: '#44271A', 'film-tv': '#19372C', gaming: '#24341B', music: '#3A2F14', sports: '#17363A' };

  return (
    <Screen padded={false}>
      <FlatList
        data={categories}
        keyExtractor={(c) => c.slug}
        contentContainerStyle={styles.grid}
        refreshing={categoriesQuery.isFetching}
        onRefresh={() => {
          categoriesQuery.refetch();
          countsQuery.refetch();
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}><AppText variant="title">Directory</AppText><Ionicons name="chevron-down" size={18} color={colors.textSecondary} /></View>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
              <TextInput placeholder="Search categories..." placeholderTextColor={colors.textMuted} style={styles.search} />
              <Pressable accessibilityLabel="Filter categories"><Ionicons name="options-outline" size={20} color={colors.textSecondary} /></Pressable>
            </View>
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
          <CategoryCard name={item.name} icon={item.icon as IoniconName} count={counts[item.slug]} fillColor={fills[item.slug]}
            onPress={() => navigation.navigate('ContactList', { categorySlug: item.slug })} />
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  searchRow: { height: 42, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  search: { flex: 1, color: colors.textPrimary, fontSize: 14 },
  grid: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skeletonCard: { flexBasis: '100%', flexGrow: 1 },
  empty: { paddingHorizontal: spacing.md, paddingVertical: spacing.xl, textAlign: 'center' },
});
