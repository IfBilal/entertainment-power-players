import { useMemo, useRef, useState } from 'react';
import { Modal, Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Card, EmptyState, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { fetchCategories, fetchContactsByCategory, type Contact } from '../../services/supabase/directory';
import {
  availableCities,
  availableRoles,
  filterContacts,
  groupByLetter,
  searchContacts,
  type ContactFilters,
} from '../../utils/contactSearch';
import { useDebouncedValue } from '../../utils/useDebouncedValue';
import { useFavorites } from '../../hooks/useFavorites';
import { useAppStore } from '../../store/useAppStore';
import { isScreenLocked } from '../../utils/paywall';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'ContactList'>;

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function ContactListScreen({ route, navigation }: Props) {
  const { categorySlug } = route.params;
  const isPro = useAppStore((s) => s.isPro);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const [filters, setFilters] = useState<ContactFilters>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const listRef = useRef<SectionList<Contact>>(null);

  const locked = isScreenLocked('directoryContactList', isPro);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const contactsQuery = useQuery({
    queryKey: ['contacts', categorySlug],
    queryFn: () => fetchContactsByCategory(categorySlug),
    enabled: !locked,
  });

  const { isFavorite, toggleFavorite } = useFavorites();

  const category = categoriesQuery.data?.find((c) => c.slug === categorySlug);
  const categoryContacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);

  const filtered = useMemo(
    () => filterContacts(searchContacts(categoryContacts, debouncedQuery), filters),
    [categoryContacts, debouncedQuery, filters],
  );

  const sections = useMemo(
    () => groupByLetter(filtered).map((g) => ({ title: g.letter, data: g.contacts })),
    [filtered],
  );

  const roles = useMemo(() => availableRoles(categoryContacts), [categoryContacts]);
  const cities = useMemo(() => availableCities(categoryContacts), [categoryContacts]);
  const activeFilterCount = (filters.role ? 1 : 0) + (filters.city ? 1 : 0);

  function jumpToLetter(letter: string) {
    const sectionIndex = sections.findIndex((s) => s.title === letter);
    if (sectionIndex < 0) return;
    listRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, viewPosition: 0 });
  }

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
        <Button label="See plans" onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'directory' })} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <AppText variant="title">{category?.name ?? 'Directory'}</AppText>
        <View style={styles.searchRow}>
          <TextInput
            placeholder="Search by name, company or role"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable
            onPress={() => setFilterSheetOpen(true)}
            style={[styles.filterButton, activeFilterCount > 0 && styles.filterButtonActive]}
            accessibilityLabel="Filter contacts"
          >
            <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? colors.textInverse : colors.accent} />
          </Pressable>
        </View>
        {activeFilterCount > 0 ? (
          <Pressable onPress={() => setFilters({})} style={styles.clearFilters}>
            <AppText variant="caption" color={colors.accent}>
              {[filters.role, filters.city].filter(Boolean).join(' · ')} — clear
            </AppText>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.listRow}>
        <SectionList
          ref={listRef}
          style={styles.list}
          sections={sections}
          keyExtractor={(item) => item.id}
          stickySectionHeadersEnabled
          refreshing={contactsQuery.isFetching}
          onRefresh={() => contactsQuery.refetch()}
          onScrollToIndexFailed={() => undefined}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <AppText variant="label" color={colors.textSecondary}>
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable style={styles.row} onPress={() => navigation.navigate('ContactDetail', { contactId: item.id })}>
              <View style={styles.rowText}>
                <AppText variant="bodyStrong">{item.name}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {item.role}{item.company ? ` · ${item.company}` : ''}
                </AppText>
              </View>
              <Pressable
                onPress={() => toggleFavorite(item.id)}
                hitSlop={8}
                accessibilityLabel={isFavorite(item.id) ? 'Remove favourite' : 'Add favourite'}
              >
                <Ionicons
                  name={isFavorite(item.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={colors.accent}
                />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={
            contactsQuery.isLoading ? null : (
              <EmptyState
                icon="search-outline"
                title="No contacts found"
                description={query || activeFilterCount > 0 ? 'Try a different search or clear your filters.' : undefined}
              />
            )
          }
        />
        <View style={styles.jumpBar}>
          {ALPHABET.map((letter) => {
            const hasSection = sections.some((s) => s.title === letter);
            return (
              <Pressable key={letter} onPress={() => jumpToLetter(letter)} disabled={!hasSection} hitSlop={2}>
                <AppText variant="caption" color={hasSection ? colors.accent : colors.border}>
                  {letter}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Modal visible={filterSheetOpen} transparent animationType="slide" onRequestClose={() => setFilterSheetOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setFilterSheetOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <AppText variant="subtitle">Filter</AppText>

            <AppText variant="label" color={colors.textMuted} style={styles.filterLabel}>ROLE</AppText>
            <View style={styles.chips}>
              {roles.length === 0 ? <AppText variant="caption" color={colors.textSecondary}>No roles in this category</AppText> : null}
              {roles.map((role) => (
                <Pressable
                  key={role}
                  onPress={() => setFilters((f) => ({ ...f, role: f.role === role ? undefined : role }))}
                  style={[styles.chip, filters.role === role && styles.chipActive]}
                >
                  <AppText variant="caption" color={filters.role === role ? colors.textInverse : colors.textPrimary}>
                    {role}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <AppText variant="label" color={colors.textMuted} style={styles.filterLabel}>CITY</AppText>
            <View style={styles.chips}>
              {cities.length === 0 ? <AppText variant="caption" color={colors.textSecondary}>No cities in this category</AppText> : null}
              {cities.map((city) => (
                <Pressable
                  key={city}
                  onPress={() => setFilters((f) => ({ ...f, city: f.city === city ? undefined : city }))}
                  style={[styles.chip, filters.city === city && styles.chipActive]}
                >
                  <AppText variant="caption" color={filters.city === city ? colors.textInverse : colors.textPrimary}>
                    {city}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <View style={styles.sheetActions}>
              <Button label="Clear" variant="secondary" onPress={() => setFilters({})} />
              <Button label="Done" onPress={() => setFilterSheetOpen(false)} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  heading: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  search: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  clearFilters: { marginTop: spacing.xs },
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
  rowText: { flex: 1, marginRight: spacing.sm },
  jumpBar: {
    width: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  backdrop: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  filterLabel: { marginTop: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sheetActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
});
