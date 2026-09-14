import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, EmptyState, Screen } from '../../components';
import { colors, radius, spacing, type IoniconName } from '../../theme';
import { fetchCategories, fetchCategoryCounts } from '../../services/supabase/directory';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'CategoryGrid'>;

export function CategoryGridScreen({ navigation }: Props) {
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const countsQuery = useQuery({ queryKey: ['categoryCounts'], queryFn: fetchCategoryCounts });

  const categories = categoriesQuery.data ?? [];
  const counts = countsQuery.data ?? {};

  return (
    <Screen>
      <AppText variant="label" color={colors.textMuted} style={styles.eyebrow}>
        DIRECTORY
      </AppText>
      <AppText variant="title" style={styles.heading}>
        Who you should know
      </AppText>

      {categoriesQuery.isError ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="Couldn't load categories"
          description="Check your connection and pull to try again."
        />
      ) : (
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
          ListEmptyComponent={
            categoriesQuery.isLoading ? null : <EmptyState icon="folder-open-outline" title="No categories yet" />
          }
          renderItem={({ item }) => {
            const count = counts[item.slug];
            return (
              <Pressable style={styles.cell} onPress={() => navigation.navigate('ContactList', { categorySlug: item.slug })}>
                <Card style={styles.card}>
                  <View style={styles.iconWrap}>
                    <Ionicons name={item.icon as IoniconName} size={22} color={colors.accent} />
                  </View>
                  <AppText variant="bodyStrong" style={styles.cardTitle}>
                    {item.name}
                  </AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {count === undefined ? '—' : `${count} contact${count === 1 ? '' : 's'}`}
                  </AppText>
                </Card>
              </Pressable>
            );
          }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { marginTop: spacing.xs },
  heading: { marginBottom: spacing.md },
  grid: { gap: spacing.sm, paddingBottom: spacing.lg },
  row: { gap: spacing.sm },
  cell: { flex: 1 },
  card: { alignItems: 'flex-start', minHeight: 112, borderRadius: radius.lg },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { marginTop: spacing.sm },
});
