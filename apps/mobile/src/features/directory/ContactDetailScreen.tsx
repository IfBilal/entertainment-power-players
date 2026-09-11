import { Linking, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { mockContacts } from '../../services/mock/contacts';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { useTrackerStore } from '../../store/useTrackerStore';
import type { DirectoryStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<DirectoryStackParamList, 'ContactDetail'>;

export function ContactDetailScreen({ route }: Props) {
  const { contactId } = route.params;
  const contact = mockContacts.find((c) => c.id === contactId);
  const isFavorite = useFavoritesStore((s) => s.favoriteContactIds.has(contactId));
  const toggleFavorite = useFavoritesStore((s) => s.toggleContact);
  const addEntry = useTrackerStore((s) => s.addEntry);

  if (!contact) {
    return (
      <Screen>
        <AppText variant="body">Contact not found.</AppText>
      </Screen>
    );
  }

  const fields: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string; value?: string; onPress?: () => void }> = [
    { icon: 'call-outline', label: 'Call', value: contact.phone, onPress: () => contact.phone && Linking.openURL(`tel:${contact.phone}`) },
    { icon: 'mail-outline', label: 'Email', value: contact.email, onPress: () => contact.email && Linking.openURL(`mailto:${contact.email}`) },
    { icon: 'globe-outline', label: 'Website', value: contact.website, onPress: () => contact.website && Linking.openURL(contact.website) },
  ];

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <AppText variant="title">{contact.name}</AppText>
          <AppText variant="body" color={colors.textSecondary}>
            {contact.role}{contact.company ? ` · ${contact.company}` : ''}
          </AppText>
        </View>
        <Pressable onPress={() => toggleFavorite(contact.id)} accessibilityRole="button" accessibilityLabel="Toggle favourite">
          <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={26} color={colors.accent} />
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

      <Pressable
        onPress={() =>
          addEntry({ type: 'contact', title: `Marked ${contact.name} as contacted`, contactId: contact.id, date: new Date() })
        }
      >
        <Card style={styles.markContacted}>
          <Ionicons name="checkmark-circle-outline" size={20} color={colors.accent} />
          <AppText variant="bodyStrong" style={styles.fieldValue}>
            Mark as contacted
          </AppText>
        </Card>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  city: { marginTop: spacing.xs },
  fields: { marginTop: spacing.lg, gap: spacing.sm },
  fieldCard: { flexDirection: 'row', alignItems: 'center' },
  fieldValue: { marginLeft: spacing.sm },
  notes: { marginTop: spacing.md },
  markContacted: { marginTop: spacing.lg, flexDirection: 'row', alignItems: 'center' },
});
