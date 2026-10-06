import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, IconTile, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useTracks } from '../../hooks/useContent';
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
  const tracksQuery = useTracks();
  const tracks = tracksQuery.data ?? [];

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
      <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>FIND YOUR FOCUS</AppText>
      <AppText variant="display" style={styles.heading}>
        Choose Your Tracks
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Select the areas you want to focus on. You can change this later.
      </AppText>
      <AppText variant="captionStrong" color={colors.accent} style={styles.selectionCount}>{selected.length} selected</AppText>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isSelected = selected.includes(item.slug);
          const hue = index % 2 === 0 ? colors.accentOrange : colors.accent;
          return (
            <Pressable
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => toggle(item.slug)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={item.name}
            >
              <IconTile icon="shapes-outline" categorySlug={item.slug} size="lg" circle fillColor={index % 2 === 0 ? colors.accentOrangeSoft : colors.accentSoft} glyphColor={hue} />
              <AppText variant="bodyStrong" style={styles.cardLabel}>
                {item.name}
              </AppText>
              {isSelected ? <View style={styles.selectedMark}><Ionicons name="checkmark" size={13} color={colors.textInverse} /></View> : null}
            </Pressable>
          );
        }}
      />
      {tracksQuery.isPending ? <AppText variant="caption" color={colors.textSecondary}>Loading tracks…</AppText> : null}
      {tracksQuery.isError ? (
        <Pressable onPress={() => tracksQuery.refetch()} accessibilityRole="button">
          <AppText variant="caption" color={colors.danger}>Couldn&apos;t load tracks. Tap to retry.</AppText>
        </Pressable>
      ) : null}
      {tracksQuery.isSuccess && tracks.length === 0 ? <AppText variant="caption" color={colors.textSecondary}>No tracks are available yet.</AppText> : null}
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
      <Button
        label="Continue"
        size="lg"
        fullWidth
        disabled={selected.length === 0 || submitting || tracksQuery.isPending || tracksQuery.isError}
        onPress={handleContinue}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.lg, marginBottom: spacing.xs },
  heading: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  selectionCount: { textAlign: 'center', marginBottom: spacing.lg },
  list: {
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  row: {
    gap: spacing.md,
    justifyContent: 'center',
  },
  card: {
    width: '47%',
    height: 156,
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
    borderColor: colors.accent,
    borderWidth: 2,
    backgroundColor: colors.accentFaint,
  },
  selectedMark: { position: 'absolute', top: spacing.sm, right: spacing.sm, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  cardLabel: {
    textAlign: 'center',
  },
  error: {
    marginBottom: spacing.sm,
  },
});
