import { FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AppText, CategoryCard, ErrorState, Screen, Skeleton } from '../../components';
import { colors, spacing, type IoniconName } from '../../theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { fetchCategories, fetchCategoryCounts } from '../../services/supabase/directory';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'CategoryGrid'>;

export function CategoryGridScreen({ navigation }: Props) {
  const [search, setSearch] = useState('');
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const countsQuery = useQuery({ queryKey: ['categoryCounts'], queryFn: fetchCategoryCounts });

  const categories = categoriesQuery.data ?? [];
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return query ? categories.filter((category) => category.name.toLocaleLowerCase().includes(query)) : categories;
  }, [categories, search]);
  const counts = countsQuery.data ?? {};
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const fills: Record<string, string> = { fashion: '#FFF2E8', 'film-tv': '#EAF5EE', gaming: '#EEF6E9', music: '#FFF6E6', sports: '#E8F4F4' };
  const glyphs: Record<string, string> = { fashion: '#A94812', 'film-tv': '#216B36', gaming: '#337326', music: '#8F5B00', sports: '#196A73' };

  return (
    <Screen padded={false}>
      <FlatList
        data={filteredCategories}
        keyExtractor={(c) => c.slug}
        contentContainerStyle={styles.grid}
        refreshing={categoriesQuery.isFetching}
        onRefresh={() => {
          categoriesQuery.refetch();
          countsQuery.refetch();
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.titleRow}><AppText variant="title">Directory</AppText></View>
            <View style={styles.searchRow}>
              <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
              <TextInput
                placeholder="Search categories..."
                placeholderTextColor={colors.textMuted}
                style={styles.search}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search categories"
                returnKeyType="search"
              />
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
              {search.trim() ? 'No matching categories.' : 'No categories yet.'}
            </AppText>
          )
        }
        renderItem={({ item }) => (
          <CategoryCard slug={item.slug} name={item.name} icon={item.icon as IoniconName} count={counts[item.slug]} fillColor={fills[item.slug]} glyphColor={glyphs[item.slug]}
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
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  searchRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  search: { flex: 1, color: colors.textPrimary, fontSize: 16 },
  grid: { gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
  skeletonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  skeletonCard: { flexBasis: '100%', flexGrow: 1 },
  empty: { paddingHorizontal: spacing.md, paddingVertical: spacing.xl, textAlign: 'center' },
});
