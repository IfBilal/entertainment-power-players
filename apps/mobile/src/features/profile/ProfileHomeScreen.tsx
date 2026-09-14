import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Card, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { tracks } from '../../services/mock/challenges';
import { deleteAccount, signOut } from '../../services/supabase/auth';
import { updateSelectedTracks } from '../../services/supabase/profile';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen({ navigation }: Props) {
  const isPro = useAppStore((s) => s.isPro);
  const userId = useAuthStore((s) => s.userId);
  const selectedTrackSlugs = useAuthStore((s) => s.selectedTrackSlugs) ?? [];
  const setSelectedTrackSlugs = useAuthStore((s) => s.setSelectedTrackSlugs);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggleTrack(slug: string) {
    if (!userId) return;
    const next = selectedTrackSlugs.includes(slug)
      ? selectedTrackSlugs.filter((s) => s !== slug)
      : [...selectedTrackSlugs, slug];
    // Keep at least one track selected -- an empty list is what RootNavigator
    // reads as "onboarding not finished", which would bounce them back to
    // the track picker mid-session.
    if (next.length === 0) return;

    const previous = selectedTrackSlugs;
    setSelectedTrackSlugs(next);
    try {
      await updateSelectedTracks(userId, next);
    } catch {
      setSelectedTrackSlugs(previous);
      setError('Could not save your tracks. Check your connection and try again.');
    }
  }

  async function handleLogOut() {
    setBusy(true);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not log out.');
    } finally {
      setBusy(false);
    }
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await deleteAccount();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not delete your account.');
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title" style={styles.heading}>Profile</AppText>

        <Card style={styles.card}>
          <View style={styles.subRow}>
            <AppText variant="bodyStrong">Subscription</AppText>
            {isPro ? (
              <View style={styles.proBadge}>
                <AppText variant="label" color={colors.accentDeep}>PRO</AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="caption" color={colors.textSecondary}>
            {isPro ? 'Renews monthly' : 'Free plan'}
          </AppText>
          <Button
            label={isPro ? 'Manage subscription' : 'Upgrade to Pro'}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'profile' })}
          />
        </Card>

        <Card style={styles.card}>
          <AppText variant="bodyStrong">Your tracks</AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            Pinned to the top of Challenges. Tap to change.
          </AppText>
          {tracks.map((track) => {
            const isSelected = selectedTrackSlugs.includes(track.slug);
            return (
              <Pressable key={track.slug} style={styles.trackRow} onPress={() => toggleTrack(track.slug)}>
                <AppText variant="body">{track.name}</AppText>
                <Ionicons
                  name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={isSelected ? colors.accent : colors.border}
                />
              </Pressable>
            );
          })}
        </Card>

        <Card style={styles.card}>
          <AppText variant="bodyStrong">Notifications</AppText>
          <View style={styles.row}>
            <AppText variant="body">Weekly digest</AppText>
            <Switch value onValueChange={() => undefined} trackColor={{ true: colors.accent, false: colors.border }} thumbColor={colors.surfaceRaised} />
          </View>
        </Card>

        {error ? (
          <AppText variant="caption" color={colors.danger} style={styles.error}>
            {error}
          </AppText>
        ) : null}

        <View style={styles.links}>
          <Button label="Privacy policy" variant="ghost" onPress={() => undefined} />
          <Button label="Terms of service" variant="ghost" onPress={() => undefined} />
          <Button label="Contact support" variant="ghost" onPress={() => undefined} />
          <Button label="Log out" variant="secondary" onPress={handleLogOut} disabled={busy} />
          <Button label="Delete account" variant="destructive" onPress={confirmDeleteAccount} disabled={busy} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  heading: { marginBottom: spacing.md },
  card: { marginBottom: spacing.sm, gap: spacing.xs },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  proBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  error: { marginBottom: spacing.sm },
  links: { marginTop: spacing.xs, gap: spacing.xs },
});
