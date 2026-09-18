import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Divider, Screen, SectionHeader, SettingsRow, Tag } from '../../components';
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
  const [tracksOpen, setTracksOpen] = useState(false);
  const [notificationsOn, setNotificationsOn] = useState(true);

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
        <AppText variant="label" color={colors.textTertiary}>YOUR PROFILE</AppText>

        <View style={styles.identity}>
          <View style={styles.avatar}>
            <AppText variant="bodyStrong" color={colors.textInverse}>
              {(userId ?? '?').slice(0, 1).toUpperCase()}
            </AppText>
          </View>
          <View style={styles.identityText}>
            <AppText variant="title">Your account</AppText>
            {isPro ? <Tag label="PRO" tone="accent" /> : <Tag label="FREE" tone="neutral" />}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader label="YOUR CAREER" />
          <SettingsRow
            icon="flag-outline"
            title="Your tracks"
            subtitle={`${selectedTrackSlugs.length} selected · pinned to Challenges`}
            onPress={() => setTracksOpen((v) => !v)}
          />
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
          <SectionHeader label="SUBSCRIPTION" />
          <SettingsRow
            icon="sparkles-outline"
            title={isPro ? 'Power Players Pro' : 'Free plan'}
            subtitle={isPro ? 'Renews monthly · manage anytime' : 'Upgrade for full access'}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'profile' })}
          />
        </View>

        <View style={styles.section}>
          <SectionHeader label="PREFERENCES" />
          <SettingsRow
            icon="notifications-outline"
            title="Weekly digest"
            subtitle="A summary of your momentum each week"
            trailing={
              <Switch
                value={notificationsOn}
                onValueChange={setNotificationsOn}
                trackColor={{ true: colors.accent, false: colors.border }}
                thumbColor={colors.surfaceRaised}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <SectionHeader label="ABOUT" />
          <SettingsRow icon="shield-checkmark-outline" title="Privacy policy" onPress={() => undefined} />
          <SettingsRow icon="document-text-outline" title="Terms of service" onPress={() => undefined} />
          <SettingsRow icon="help-circle-outline" title="Contact support" onPress={() => undefined} />
        </View>

        {error ? (
          <AppText variant="caption" color={colors.danger} style={styles.error}>
            {error}
          </AppText>
        ) : null}

        <Divider tone="subtle" style={styles.divider} />

        <View style={styles.section}>
          <SectionHeader label="ACCOUNT" />
          <SettingsRow icon="log-out-outline" title="Log out" onPress={handleLogOut} trailing={null} />
          <SettingsRow icon="trash-outline" title="Delete account" tone="danger" onPress={confirmDeleteAccount} trailing={null} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  identity: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md, marginBottom: spacing.lg },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityText: { gap: spacing.xs },
  section: { marginBottom: spacing.lg },
  trackList: { paddingLeft: spacing.md },
  divider: { marginBottom: spacing.lg },
  error: { marginBottom: spacing.sm },
});
