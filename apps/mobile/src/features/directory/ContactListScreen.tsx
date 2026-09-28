import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, SectionList, StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, BottomSheet, Button, ContactRow, ErrorState, PaywallCard, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { fetchCategories, fetchContactsByCategory, type Contact } from '../../services/supabase/directory';
import {
  availableCities,
  availableRoles,
  filterContacts,
  groupByLetter,
  searchContacts,
  sectionIndexForLetter,
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
  const pendingSectionIndex = useRef<number | null>(null);
  const scrollRecoveryAttempts = useRef(0);
  const scrollRecoveryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (scrollRecoveryTimer.current) clearTimeout(scrollRecoveryTimer.current);
  }, []);

  const locked = isScreenLocked('directoryContactList', isPro);

  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const contactsQuery = useQuery({
    queryKey: ['contacts', categorySlug],
    queryFn: () => fetchContactsByCategory(categorySlug),
    enabled: !locked,
  });

  const { favoriteIds, isFavorite, toggleFavorite } = useFavorites();

  const category = categoriesQuery.data?.find((c) => c.slug === categorySlug);
  const categoryContacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);

  const filtered = useMemo(
    () => filterContacts(searchContacts(categoryContacts, debouncedQuery), filters, favoriteIds),
    [categoryContacts, debouncedQuery, filters, favoriteIds],
  );

  const sections = useMemo(
    () => groupByLetter(filtered).map((g) => ({ title: g.letter, data: g.contacts })),
    [filtered],
  );

  const roles = useMemo(() => availableRoles(categoryContacts), [categoryContacts]);
  const cities = useMemo(() => availableCities(categoryContacts), [categoryContacts]);
  const activeFilterCount = (filters.role ? 1 : 0) + (filters.city ? 1 : 0) + (filters.favoritesOnly ? 1 : 0);

  function jumpToLetter(letter: string) {
    const sectionIndex = sectionIndexForLetter(sections.map((section) => section.title), letter);
    if (sectionIndex < 0) return;
    pendingSectionIndex.current = sectionIndex;
    scrollRecoveryAttempts.current = 0;
    if (scrollRecoveryTimer.current) clearTimeout(scrollRecoveryTimer.current);
    listRef.current?.scrollToLocation({ sectionIndex, itemIndex: 0, viewPosition: 0 });
  }

  function recoverFailedScroll({ index, highestMeasuredFrameIndex, averageItemLength }: {
    index: number;
    highestMeasuredFrameIndex: number;
    averageItemLength: number;
  }) {
    const sectionIndex = pendingSectionIndex.current;
    if (sectionIndex === null || scrollRecoveryAttempts.current >= 12) {
      pendingSectionIndex.current = null;
      return;
    }
    scrollRecoveryAttempts.current += 1;
    const estimatedLength = averageItemLength > 0 ? averageItemLength : 72;
    const estimatedIndex = Math.max(index, highestMeasuredFrameIndex + 1, 0);
    listRef.current?.getScrollResponder()?.scrollTo({ y: estimatedLength * estimatedIndex, animated: false });
    if (scrollRecoveryTimer.current) clearTimeout(scrollRecoveryTimer.current);
    scrollRecoveryTimer.current = setTimeout(() => {
      const target = pendingSectionIndex.current;
      if (target !== null) listRef.current?.scrollToLocation({ sectionIndex: target, itemIndex: 0, viewPosition: 0 });
    }, 180);
  }

  if (locked) {
    return (
      <Screen>
        <AppText variant="label" color={colors.textTertiary}>
          {category?.name?.toUpperCase() ?? 'DIRECTORY'}
        </AppText>
        <AppText variant="title" style={styles.lockedHeading}>
          Your industry network is waiting.
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.lockedBody}>
          Unlock the full directory and start building your network.
        </AppText>
        <View style={styles.benefits}>
          <PaywallCard icon="people-outline" text="Access every contact in this category" />
          <PaywallCard icon="heart-outline" text="Save favourites for quick follow-up" />
          <PaywallCard icon="checkmark-done-outline" text="Track conversations in your tracker" />
        </View>
        <Button label="Unlock directory" onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'directory' })} />
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <AppText variant="title">{category?.name ?? 'Directory'}</AppText>
        <View style={styles.searchRow}>
          <View style={styles.searchWrap}>
            <Ionicons name="search-outline" size={17} color={colors.textTertiary} style={styles.searchIcon} />
            <TextInput
              placeholder="Search contacts..."
              accessibilityLabel="Search contacts"
              value={query}
              onChangeText={setQuery}
              style={styles.search}
              placeholderTextColor={colors.textMuted}
            />
          </View>
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
              {[filters.role, filters.city, filters.favoritesOnly ? 'Favorites only' : undefined].filter(Boolean).join(' · ')} — clear
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
          onScrollToIndexFailed={recoverFailedScroll}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <AppText variant="label" color={colors.textTertiary}>
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <ContactRow
              name={item.name}
              role={item.role}
              company={item.company ?? undefined}
              city={item.city ?? undefined}
              favorite={isFavorite(item.id)}
              onPress={() => navigation.navigate('ContactDetail', { contactId: item.id, city: item.city })}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
          ListEmptyComponent={
            contactsQuery.isError ? (
              <ErrorState title="Couldn't load contacts" description="Check your connection and try again." onRetry={() => contactsQuery.refetch()} />
            ) : contactsQuery.isLoading ? null : (
              <AppText variant="body" color={colors.textSecondary} style={styles.emptyText}>
                {query || activeFilterCount > 0
                  ? 'No people found. Try a different name, company, or role.'
                  : 'No contacts in this category yet.'}
              </AppText>
            )
          }
        />
        <View style={styles.jumpBar}>
          {ALPHABET.map((letter) => {
            const hasSection = sections.length > 0;
            return (
              <Pressable
                key={letter}
                onPress={() => jumpToLetter(letter)}
                disabled={!hasSection}
                hitSlop={5}
                accessibilityRole="button"
                accessibilityLabel={`Jump to ${letter}`}
                style={styles.jumpTarget}
              >
                <AppText variant="caption" color={hasSection ? colors.accent : colors.borderSubtle} style={styles.jumpLetter}>
                  {letter}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <BottomSheet visible={filterSheetOpen} onClose={() => setFilterSheetOpen(false)}>
        <View style={styles.sheetHeader}>
          <AppText variant="subtitle">Filters</AppText>
          <Pressable onPress={() => setFilters({})}>
            <AppText variant="caption" color={colors.accent}>Clear all</AppText>
          </Pressable>
        </View>

        <AppText variant="label" color={colors.textTertiary} style={styles.filterLabel}>ROLE</AppText>
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

        <AppText variant="label" color={colors.textTertiary} style={styles.filterLabel}>CITY</AppText>
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

        <AppText variant="label" color={colors.textTertiary} style={styles.filterLabel}>FAVORITES</AppText>
        <View style={styles.chips}>
          <Pressable
            onPress={() => setFilters((f) => ({ ...f, favoritesOnly: !f.favoritesOnly }))}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: Boolean(filters.favoritesOnly) }}
            accessibilityLabel="Favorites only"
            style={[styles.chip, filters.favoritesOnly && styles.chipActive]}
          >
            <AppText variant="caption" color={filters.favoritesOnly ? colors.textInverse : colors.textPrimary}>
              ★ Favorites only
            </AppText>
          </Pressable>
        </View>

        <View style={styles.sheetActions}>
          <Button label="Apply filters" onPress={() => setFilterSheetOpen(false)} />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  lockedHeading: { marginTop: spacing.md },
  lockedBody: { marginTop: spacing.sm, marginBottom: spacing.lg },
  benefits: { gap: spacing.sm, marginBottom: spacing.xl },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  searchWrap: { flex: 1, position: 'relative', justifyContent: 'center' },
  searchIcon: { position: 'absolute', left: spacing.sm + 2, zIndex: 1 },
  search: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: spacing.xl,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceRaised,
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
  emptyText: { paddingHorizontal: spacing.md, paddingVertical: spacing.xl, textAlign: 'center' },
  jumpBar: {
    width: 44,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  jumpTarget: { width: '100%', flex: 1, minHeight: 16, alignItems: 'center', justifyContent: 'center' },
  jumpLetter: { fontSize: 10, lineHeight: 13 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
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
