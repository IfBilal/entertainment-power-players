import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, EmptyState, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { fetchCategories, fetchContactById, logContactedActivity } from '../../services/supabase/directory';
import { useFavorites } from '../../hooks/useFavorites';
import { useAuthStore } from '../../store/useAuthStore';
import { computeWeekKey } from '../../utils/weekKey';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'ContactDetail'>;

export function ContactDetailScreen({ route }: Props) {
  const { contactId } = route.params;
  const userId = useAuthStore((s) => s.userId);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [contactedState, setContactedState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  const contactQuery = useQuery({
    queryKey: ['contact', contactId],
    queryFn: () => fetchContactById(contactId),
  });
  const categoriesQuery = useQuery({ queryKey: ['categories'], queryFn: fetchCategories });
  const contact = contactQuery.data;
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
      await logContactedActivity({
        userId,
        contactId: contact.id,
        contactName: contact.name,
        weekKey: computeWeekKey(new Date()),
      });
      setContactedState('done');
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
  const contacted = contactedState === 'done';

  return (
    <Screen>
      {categoryName ? (
        <AppText variant="label" color={colors.textTertiary}>
          {categoryName.toUpperCase()}
        </AppText>
      ) : null}

      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="display" style={styles.name}>{contact.name}</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.role}>
            {contact.role}{contact.company ? ` · ${contact.company}` : ''}
          </AppText>
          {contact.city ? (
            <AppText variant="caption" color={colors.textTertiary} style={styles.city}>
              {contact.city}
            </AppText>
          ) : null}
        </View>
        <Pressable onPress={() => toggleFavorite(contact.id)} accessibilityRole="button" accessibilityLabel="Toggle favourite" hitSlop={8}>
          <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={26} color={colors.accent} />
        </Pressable>
      </View>

      {fields.length > 0 ? (
        <View style={styles.fields}>
          {fields.map((f) => (
            <Pressable key={f.label} onPress={f.onPress}>
              <Card style={styles.fieldCard} elevation="none">
                <View style={styles.fieldIconWrap}>
                  <Ionicons name={f.icon} size={18} color={colors.accent} />
                </View>
                <View>
                  <AppText variant="caption" color={colors.textTertiary}>{f.label}</AppText>
                  <AppText variant="bodyStrong">{f.value}</AppText>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : null}

      {contact.notes ? (
        <Card style={styles.notes} elevation="none">
          <AppText variant="caption" color={colors.textTertiary}>
            Notes
          </AppText>
          <AppText variant="body" style={styles.notesText}>{contact.notes}</AppText>
        </Card>
      ) : null}

      <View style={styles.spacer} />

      <Pressable onPress={handleMarkContacted} disabled={contactedState === 'saving' || contacted}>
        <View style={[styles.markContacted, contacted && styles.markContactedDone]}>
          <Ionicons
            name={contacted ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={contacted ? colors.success : colors.textInverse}
          />
          <AppText variant="button" color={contacted ? colors.success : colors.textInverse} style={styles.markContactedText}>
            {contacted ? 'Logged to your tracker' : 'Mark as contacted'}
          </AppText>
        </View>
      </Pressable>
      {contactedState === 'error' ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          Couldn't log that. Check your connection and try again.
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.xs },
  headerText: { flex: 1, marginRight: spacing.md },
  name: { marginTop: spacing.xs },
  role: { marginTop: spacing.xs },
  city: { marginTop: 2 },
  fields: { marginTop: spacing.lg, gap: spacing.sm },
  fieldCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surfaceSubtle },
  fieldIconWrap: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notes: { marginTop: spacing.md, backgroundColor: colors.surfaceSubtle },
  notesText: { marginTop: spacing.xs },
  spacer: { flex: 1, minHeight: spacing.lg },
  markContacted: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  markContactedDone: {
    backgroundColor: colors.successSoft,
  },
  markContactedText: {},
  error: { marginTop: spacing.xs, textAlign: 'center' },
});
