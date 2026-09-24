import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Avatar, Divider, Screen, SettingsRow, Tag } from '../../components';
import { colors, spacing } from '../../theme';
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
  const [tracksOpen, setTracksOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

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
      'This permanently deletes your account and all your data, and signs you out. This cannot be undone.',
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
        <AppText variant="title">Profile</AppText>
        <Pressable style={styles.identity} onPress={() => navigation.navigate('EditProfile')} accessibilityRole="button" accessibilityLabel="Edit profile">
          <Avatar name="Bilal Tahir" size="lg" />
          <View style={styles.identityText}><AppText variant="title">Bilal Tahir</AppText><AppText variant="caption" color={colors.textSecondary}>{isPro ? 'Pro Member' : 'Free Member'}</AppText></View>
        </Pressable>

        <View style={styles.section}>
          <SettingsRow icon="flag-outline" title="Track Selection" onPress={() => setTracksOpen((v) => !v)} />
          {tracksOpen ? (
            <View style={styles.trackList}>
              {tracks.map((track) => {
                const isSelected = selectedTrackSlugs.includes(track.slug);
                return (
                  <SettingsRow
                    key={track.slug}
                    icon={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    title={track.name}
                    onPress={() => toggleTrack(track.slug)}
                    trailing={null}
                  />
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <SettingsRow icon="sparkles-outline" title="Subscription" onPress={() => navigation.navigate('Subscription')} />
          <SettingsRow icon="notifications-outline" title="Notifications" onPress={() => navigation.navigate('Notifications')} />
        </View>

        <View style={styles.section}>
          <SettingsRow icon="shield-checkmark-outline" title="Privacy & Security" onPress={() => undefined} />
          <SettingsRow icon="help-circle-outline" title="Help & Support" onPress={() => undefined} />
        </View>

        {error ? (
          <AppText variant="caption" color={colors.danger} style={styles.error}>
            {error}
          </AppText>
        ) : null}

        <View style={styles.section}>
          <SettingsRow icon="settings-outline" title="Settings" onPress={() => setSettingsOpen((value) => !value)} />
          {settingsOpen ? <View style={styles.trackList}>
            <SettingsRow icon="log-out-outline" title={busy ? 'Logging out…' : 'Log out'} onPress={handleLogOut} trailing={null} />
            <SettingsRow icon="trash-outline" title="Delete account" tone="danger" onPress={confirmDeleteAccount} trailing={null} />
          </View> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg },
  identityText: { gap: spacing.xs },
  section: { marginBottom: spacing.lg },
  trackList: { paddingLeft: spacing.md },
  divider: { marginBottom: spacing.md },
  error: { marginBottom: spacing.sm },
});
