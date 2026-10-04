import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Card, CategoryGlyph, EmptyState, Screen, Tag } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { fetchCategories, fetchContactById } from '../../services/supabase/directory';
import { activityQueryKey, createActivity } from '../../services/supabase/activity';
import { useUserActivity } from '../../hooks/useUserActivity';
import type { ActivityEntry } from '../../services/mock/tracker';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuthStore } from '../../store/useAuthStore';
import { computeWeekKey } from '../../utils/weekKey';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'ContactDetail'>;

export function ContactDetailScreen({ route }: Props) {
  const { contactId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();
  const activityQuery = useUserActivity();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [contactedState, setContactedState] = useState<'idle' | 'saving' | 'error'>('idle');
  const weekKey = computeWeekKey(new Date());

  const contactQuery = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContactById(contactId),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const contact = contactQuery.data;
  const city = contact?.city?.trim() || route.params.city?.trim();
  const categoryName = categoriesQuery.data?.find((c) => c.slug === contact?.categorySlug)?.name;

  if (contactQuery.isLoading) {
    return <Screen />;
  }

  if (!contact) {
    return (
      <Screen>
        <EmptyState icon="person-outline" title="Contact not found" />
      </Screen>
    );
  }

  async function handleMarkContacted() {
    if (!userId || !contact) return;
    setContactedState('saving');
    try {
      const date = new Date();
      const entry = await createActivity({
        userId,
        type: 'contact',
        title: `Marked ${contact.name} as contacted`,
        contactId: contact.id,
        date,
        weekKey: computeWeekKey(date),
      });
      queryClient.setQueryData<ActivityEntry[]>(activityQueryKey(userId), (current) => [entry, ...(current ?? [])]);
      setContactedState('idle');
    } catch {
      setContactedState('error');
    }
  }

  type ContactField = { icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress: () => void };
  const allFields: ContactField[] = [
    { icon: 'call-outline', label: 'Call', value: contact.phone, onPress: () => { if (contact.phone) Linking.openURL(`tel:${contact.phone}`); } },
    { icon: 'mail-outline', label: 'Email', value: contact.email, onPress: () => { if (contact.email) Linking.openURL(`mailto:${contact.email}`); } },
    { icon: 'globe-outline', label: 'Website', value: contact.website, onPress: () => { if (contact.website) Linking.openURL(contact.website); } },
  ];
  const fields = allFields.filter((f) => Boolean(f.value));

  const favorited = isFavorite(contact.id);
  const contacted = activityQuery.data?.some((entry) =>
    entry.type === 'contact' && entry.contactId === contact.id && entry.weekKey === weekKey,
  ) ?? false;

  return (
    <Screen>

      <View style={styles.topActions}>
        <Pressable onPress={() => toggleFavorite(contact.id)} accessibilityRole="button" accessibilityLabel={favorited ? 'Remove favourite' : 'Add favourite'}>
          <Ionicons name={favorited ? 'star' : 'star-outline'} size={27} color={colors.accent} />
        </Pressable>
      </View>
      <View style={styles.profile}>
        <View style={styles.categoryBadge}><CategoryGlyph slug={contact.categorySlug} size={36} color={colors.accent} /></View>
      </View>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="display" style={styles.name}>{contact.name}</AppText>
          <AppText variant="subtitle" color={colors.textSecondary} style={styles.role}>{contact.role}</AppText>
          {contact.company ? <AppText variant="body" color={colors.textSecondary} style={styles.company}>{contact.company}</AppText> : null}
          {city ? (
            <View style={styles.location}>
              <Ionicons name="location" size={18} color={colors.accentAmber} />
              <AppText variant="body" color={colors.textSecondary}>{city}</AppText>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.tags}>{categoryName ? <Tag label={categoryName} tone="neutral" /> : null}<Tag label={contact.role} tone="accent" /></View>

      {fields.length > 0 ? (
        <View style={styles.fields}>
          {fields.map((f) => <Pressable key={f.label} onPress={f.onPress} style={styles.contactAction}><Ionicons name={f.icon} size={20} color={colors.accentAmber} /><AppText variant="bodyStrong">{f.label}</AppText></Pressable>)}
        </View>
      ) : null}

      {contact.notes ? (
        <Card style={styles.notes} elevation="none"><AppText variant="title" style={styles.sectionTitle}>Notes</AppText>
          <AppText variant="body" style={styles.notesText}>{contact.notes}</AppText>
        </Card>
      ) : null}

      <View style={styles.spacer} />

      <Button
        fullWidth
        label={contacted ? 'Added to Tracker' : 'Add to Tracker'}
        onPress={handleMarkContacted}
        disabled={!userId || activityQuery.isPending || activityQuery.isError || contactedState === 'saving' || contacted}
      />
      {activityQuery.isError ? (
        <Pressable onPress={() => activityQuery.refetch()} accessibilityRole="button" accessibilityLabel="Retry tracker status">
          <AppText variant="caption" color={colors.danger} style={styles.error}>Couldn't check tracker status. Tap to retry.</AppText>
        </Pressable>
      ) : null}
      {contactedState === 'error' ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          Couldn't log that. Check your connection and try again.
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topActions: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm },
  profile: { alignItems: 'center', marginBottom: spacing.md },
  categoryBadge: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.accentSoft, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  headerRow: { alignItems: 'center', marginTop: spacing.xs },
  headerText: { alignItems: 'center' },
  name: { marginTop: spacing.xs, textAlign: 'center' },
  role: { marginTop: spacing.xs, textAlign: 'center' },
  company: { marginTop: spacing.xs, textAlign: 'center' },
  location: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center', marginTop: spacing.sm },
  tags: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
  fields: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.sm },
  contactAction: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.pill },
  notes: { marginTop: spacing.lg, backgroundColor: colors.surfaceSubtle },
  sectionTitle: { marginBottom: spacing.sm },
  notesText: { marginTop: spacing.xs },
  spacer: { flex: 1, minHeight: spacing.lg },
  error: { marginTop: spacing.xs, textAlign: 'center' },
});
