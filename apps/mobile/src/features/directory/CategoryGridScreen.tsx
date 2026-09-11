import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, Screen } from '../../components';
import { colors, radius, spacing, categoryIconOptions, categorySlugToKey } from '../../theme';
import { mockCategories, contactCountForCategory } from '../../services/mock/contacts';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'CategoryGrid'>;

export function CategoryGridScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>
        Directory
      </AppText>
      <FlatList
        data={mockCategories}
        keyExtractor={(c) => c.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const iconKey = categorySlugToKey[item.slug];
          const icon = categoryIconOptions[iconKey].default;
          return (
            <Pressable style={styles.cell} onPress={() => navigation.navigate('ContactList', { categorySlug: item.slug })}>
              <Card style={styles.card}>
                <Ionicons name={icon} size={28} color={colors.accent} />
                <AppText variant="bodyStrong" style={styles.cardTitle}>
                  {item.name}
                </AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {contactCountForCategory(item.slug)} contacts
                </AppText>
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
  grid: { gap: spacing.sm },
  row: { gap: spacing.sm },
  cell: { flex: 1 },
  card: { alignItems: 'flex-start', minHeight: 100, borderRadius: radius.lg },
  cardTitle: { marginTop: spacing.sm },
});
