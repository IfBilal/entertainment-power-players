import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, EmptyState, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { mockContacts, mockCategories } from '../../services/mock/contacts';
import { availableCities, availableRoles, filterContacts, groupByLetter, searchContacts, type ContactFilters } from '../../utils/contactSearch';
import { useAppStore } from '../../store/useAppStore';
import { isScreenLocked } from '../../utils/paywall';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'ContactList'>;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function ContactListScreen({ route, navigation }: Props) {
  const { categorySlug } = route.params;
  const category = mockCategories.find((c) => c.slug === categorySlug);
  const isPro = useAppStore((s) => s.isPro);
  const [query, setQuery] = useState('');
  const [filters] = useState<ContactFilters>({});

  const categoryContacts = useMemo(
    () => mockContacts.filter((c) => c.categorySlug === categorySlug && c.active),
    [categorySlug],
  );

  const filtered = useMemo(
    () => filterContacts(searchContacts(categoryContacts, query), filters),
    [categoryContacts, query, filters],
  );

  const sections = useMemo(
    () => groupByLetter(filtered).map((g) => ({ title: g.letter, data: g.contacts })),
    [filtered],
  );

  const locked = isScreenLocked('directoryContactList', isPro);

  if (locked) {
    return (
      <Screen>
        <AppText variant="title" style={styles.heading}>
          {category?.name ?? 'Directory'}
        </AppText>
        <EmptyState
          icon="lock-closed-outline"
          title="Pro feature"
          description="Subscribe to see the full contact list for this category."
        />
        <Button label="See plans" onPress={() => navigation.getParent()?.navigate('Profile', { screen: 'Paywall', params: { reason: 'directory' } })} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <AppText variant="title">{category?.name ?? 'Directory'}</AppText>
        <TextInput
          placeholder="Search by name, company or role"
          value={query}
          onChangeText={setQuery}
          style={styles.search}
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      <View style={styles.listRow}>
        <SectionList
          style={styles.list}
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <AppText variant="label" color={colors.textSecondary}>
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}>
              <View>
                <AppText variant="bodyStrong">{item.name}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {item.role}{item.company ? ` · ${item.company}` : ''}
                </AppText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
          ListEmptyComponent={<EmptyState icon="search-outline" title="No contacts found" />}
        />
        <View style={styles.jumpBar}>
          {ALPHABET.map((letter) => {
            const hasSection = sections.some((s) => s.title === letter);
            return (
              <AppText key={letter} variant="caption" color={hasSection ? colors.accent : colors.border}>
                {letter}
              </AppText>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  heading: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  search: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  listRow: { flex: 1, flexDirection: 'row' },
  list: { flex: 1 },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  jumpBar: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
});
