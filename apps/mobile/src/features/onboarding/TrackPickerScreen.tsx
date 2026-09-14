import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { tracks } from '../../services/mock/challenges';
import { updateSelectedTracks } from '../../services/supabase/profile';
import { useAuthStore } from '../../store/useAuthStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TrackPicker'>;

export function TrackPickerScreen(_props: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = useAuthStore((s) => s.userId);
  const setSelectedTrackSlugs = useAuthStore((s) => s.setSelectedTrackSlugs);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  async function handleContinue() {
    if (!userId) {
      setError('You need to be signed in to save your tracks.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await updateSelectedTracks(userId, selected);
      // Flipping this in the store is what makes RootNavigator swap to the
      // Main tabs -- the source of truth is the profiles row we just wrote.
      setSelectedTrackSlugs(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your tracks. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppText variant="title">Pick your tracks</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Choose one or more — you can change this later in Profile.
      </AppText>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.slug);
          return (
            <Pressable style={[styles.row, isSelected && styles.rowSelected]} onPress={() => toggle(item.slug)}>
              <AppText variant="bodyStrong">{item.name}</AppText>
              {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : <Ionicons name="ellipse-outline" size={22} color={colors.border} />}
            </Pressable>
          );
        }}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
      <Button label="Continue" disabled={selected.length === 0 || submitting} onPress={handleContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  error: { marginBottom: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
});
