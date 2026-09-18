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
      <AppText variant="display">Choose your path.</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Pick the areas you want to focus on. You can change them later in Profile.
      </AppText>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.slug);
          return (
            <Pressable style={[styles.card, isSelected && styles.cardSelected]} onPress={() => toggle(item.slug)}>
              {isSelected ? (
                <View style={styles.check}>
                  <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                </View>
              ) : null}
              <AppText variant="bodyStrong" style={styles.cardLabel}>{item.name}</AppText>
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
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  row: { gap: spacing.sm },
  card: {
    flex: 1,
    minHeight: 96,
    justifyContent: 'flex-end',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentFaint,
  },
  check: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  cardLabel: {
    marginTop: spacing.sm,
  },
  error: { marginBottom: spacing.sm },
});
