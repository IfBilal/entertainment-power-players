import { useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing, trackIcons } from '../../theme';
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
    <Screen aurora="subtle">
      <AppText variant="display" style={styles.heading}>
        Choose Your Tracks
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Select the areas you want to focus on. You can change this later.
      </AppText>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selected.includes(item.slug);
          // Alternating amber / lime glyphs, as the mockup's grid does.
          const hue = index % 2 === 0 ? colors.accentAmber : colors.accentLime;
          return (
            <Pressable
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggle(item.slug)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={item.name}
            >
              <Ionicons name={trackIcons[item.slug] ?? 'star-outline'} size={38} color={hue} />
              <AppText variant="bodyStrong" style={styles.cardLabel}>
                {item.name}
              </AppText>
            </Pressable>
          );
        }}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
      <Button
        label="Continue"
        size="lg"
        fullWidth
        disabled={selected.length === 0 || submitting}
        onPress={handleContinue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginTop: spacing.xl,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    gap: spacing.md,
  },
  // Tall tiles with the glyph stacked above a centred label, per mockup 8.
  card: {
    flex: 1,
    height: 146,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.sm,
    backgroundColor: colors.surface,
  },
  cardSelected: {
    borderColor: colors.accentLime,
    backgroundColor: colors.accentFaint,
  },
  cardLabel: {
    textAlign: 'center',
  },
  error: {
    marginBottom: spacing.sm,
  },
});
