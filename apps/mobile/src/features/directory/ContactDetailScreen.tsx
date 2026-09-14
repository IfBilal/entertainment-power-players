import { useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, EmptyState, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { fetchContactById, logContactedActivity } from '../../services/supabase/directory';
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
  const contact = contactQuery.data;

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

  const fields: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void }> = [
    { icon: 'call-outline', label: 'Call', value: contact.phone, onPress: () => contact.phone && Linking.openURL(`tel:${contact.phone}`) },
    { icon: 'mail-outline', label: 'Email', value: contact.email, onPress: () => contact.email && Linking.openURL(`mailto:${contact.email}`) },
    { icon: 'globe-outline', label: 'Website', value: contact.website, onPress: () => contact.website && Linking.openURL(contact.website) },
  ];

  const favorited = isFavorite(contact.id);

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <AppText variant="title">{contact.name}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {contact.role}{contact.company ? ` · ${contact.company}` : ''}
          </AppText>
        </View>
        <Pressable onPress={() => toggleFavorite(contact.id)} accessibilityRole="button" accessibilityLabel="Toggle favourite">
          <Ionicons name={favorited ? 'heart' : 'heart-outline'} size={26} color={colors.accent} />
        </Pressable>
      </View>

      {contact.city ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.city}>
          {contact.city}
        </AppText>
      ) : null}

      <View style={styles.fields}>
        {fields
          .filter((f) => Boolean(f.value))
          .map((f) => (
            <Pressable key={f.label} onPress={f.onPress}>
              <Card style={styles.fieldCard}>
                <Ionicons name={f.icon} size={20} color={colors.accent} />
                <AppText variant="body" style={styles.fieldValue}>
                  {f.value}
                </AppText>
              </Card>
            </Pressable>
          ))}
      </View>

      {contact.notes ? (
        <Card style={styles.notes}>
          <AppText variant="caption" color={colors.textSecondary}>
            Notes
          </AppText>
          <AppText variant="body">{contact.notes}</AppText>
        </Card>
      ) : null}

      <Pressable onPress={handleMarkContacted} disabled={contactedState === 'saving'}>
        <Card style={styles.markContacted}>
          <Ionicons
            name={contactedState === 'done' ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={20}
            color={contactedState === 'done' ? colors.success : colors.accent}
          />
          <AppText variant="bodyStrong" style={styles.fieldValue}>
            {contactedState === 'done' ? 'Logged to your tracker' : 'Mark as contacted'}
          </AppText>
        </Card>
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
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerText: { flex: 1, marginRight: spacing.md },
  city: { marginTop: spacing.xs },
  fields: { marginTop: spacing.lg, gap: spacing.sm },
  fieldCard: { flexDirection: 'row', alignItems: 'center' },
  fieldValue: { marginLeft: spacing.sm },
  notes: { marginTop: spacing.md },
  markContacted: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center' },
  error: { marginTop: spacing.xs },
});
