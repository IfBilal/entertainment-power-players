import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Switch, View } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';
import { requestEmailChange } from '../../services/supabase/auth';
import { useAuthStore } from '../../store/useAuthStore';
import { defaultNotificationPrefs, fetchNotificationPrefs, updateNotificationPrefs, updateProfile, type NotificationPrefs } from '../../services/supabase/profile';
import { fetchSubscriptionStatus } from '../../services/supabase/billing';

function Back({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress} hitSlop={10} style={styles.back}><Ionicons name="chevron-back" size={27} color={colors.textPrimary} /></Pressable>; }

export function EditProfileScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>) {
  const displayName = useAuthStore((state) => state.displayName);
  const userId = useAuthStore((state) => state.userId);
  const setDisplayName = useAuthStore((state) => state.setDisplayName);
  const [name, setName] = useState(displayName ?? '');
  const currentEmail = useAuthStore((state) => state.emailAddress);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [email, setEmail] = useState(currentEmail ?? '');
  const [sendingEmailLink, setSendingEmailLink] = useState(false);
  const [emailLinkSent, setEmailLinkSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (currentEmail) setEmail(currentEmail);
  }, [currentEmail]);

  useEffect(() => {
    if (displayName) setName(displayName);
  }, [displayName]);

  async function saveProfile() {
    const nextName = name.trim();
    if (!userId || !nextName) {
      setProfileError('Enter your full name before saving.');
      return;
    }
    setProfileError(null);
    setSavingProfile(true);
    try {
      await updateProfile(userId, { displayName: nextName });
      setDisplayName(nextName);
      navigation.goBack();
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save your profile. Try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  const avatarName = name.trim() || displayName || 'Your profile';
  const avatarInitials = avatarName === 'Your profile'
    ? '?'
    : avatarName.split(/\s+/).filter(Boolean).map((part) => part[0]).slice(0, 2).join('').toUpperCase();

  async function sendEmailChangeLink() {
    setEmailError(null);
    setEmailLinkSent(false);
    if (!email.trim() || email.trim().toLowerCase() === currentEmail?.toLowerCase()) {
      setEmailError('Enter a different email address.');
      return;
    }
    setSendingEmailLink(true);
    try {
      await requestEmailChange(email);
      setEmailLinkSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Could not send the confirmation email. Try again.');
    } finally {
      setSendingEmailLink(false);
    }
  }

  return (
    <Screen>
      <Back onPress={() => navigation.goBack()} />
      <AppText variant="title">Edit Profile</AppText>
      <View style={styles.editAvatar}>
        <View style={styles.avatar}>
          <AppText variant="title" color={colors.textInverse}>{avatarInitials}</AppText>
        </View>
      </View>
      <View style={styles.form}>
        <FormField label="Full name" value={name} onChangeText={setName} />
        <FormField
          label="Email address"
          value={email}
          onChangeText={(value) => { setEmail(value); setEmailLinkSent(false); }}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          error={emailError ?? undefined}
        />
        {emailLinkSent ? (
          <AppText variant="caption" color={colors.accentLime}>
            Confirmation link sent. Open it on this device; if Supabase asks you to confirm both addresses, open both email links.
          </AppText>
        ) : null}
        <Button
          label={sendingEmailLink ? 'Sending confirmation…' : 'Change email address'}
          onPress={sendEmailChangeLink}
          disabled={sendingEmailLink || !email.trim()}
        />
        {profileError ? <AppText variant="caption" color={colors.danger}>{profileError}</AppText> : null}
        <Button label={savingProfile ? 'Saving…' : 'Save Changes'} onPress={saveProfile} disabled={savingProfile} />
      </View>
    </Screen>
  );
}

export function SubscriptionScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'Subscription'>) {
  const isPro = useAppStore((state) => state.isPro);
  const userId = useAuthStore((state) => state.userId);
  const statusQuery = useQuery({ queryKey: ['subscriptionStatus', userId], queryFn: () => fetchSubscriptionStatus(userId!), enabled: Boolean(userId), refetchOnMount: 'always' });
  const subscription = statusQuery.data;
  const activeUntil = subscription?.activeUntil ? new Date(subscription.activeUntil).toLocaleDateString() : null;
  const manageUrl = subscription?.platform === 'apple' ? 'https://apps.apple.com/account/subscriptions'
    : subscription?.platform === 'google' ? 'https://play.google.com/store/account/subscriptions' : null;

  function choosePlan() {
    navigation.getParent()?.getParent()?.navigate('Paywall');
  }

  return (
    <Screen>
      <Back onPress={() => navigation.goBack()} />
      <AppText variant="title">Subscription</AppText>
      <View style={styles.planCard}>
        <AppText variant="label" color={colors.textSecondary}>CURRENT PLAN</AppText>
        <AppText variant="title" color={isPro ? colors.accentLime : colors.textPrimary}>{isPro ? `${subscription?.plan === 'annual' ? 'Annual' : subscription?.plan === 'monthly' ? 'Monthly' : 'Premium'}` : 'Free'}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {isPro ? subscription?.state === 'cancelled' ? `Cancelled · access through ${activeUntil ?? 'the paid period'}` : subscription?.state === 'trial' ? `Trial · ${activeUntil ? `ends ${activeUntil}` : 'active'}` : `Active${activeUntil ? ` · ${subscription?.willRenew ? 'renews' : 'ends'} ${activeUntil}` : ''}` : 'Choose a plan to unlock premium features.'}
        </AppText>
        {statusQuery.isError ? <Pressable onPress={() => statusQuery.refetch()}><AppText variant="caption" color={colors.danger}>Billing details unavailable. Tap to retry.</AppText></Pressable> : null}
      </View>

      {!isPro ? (
        <>
          <AppText variant="body" color={colors.textSecondary} style={styles.featuresTitle}>See monthly and annual prices from your app store.</AppText>
          <Button label="Choose a plan" onPress={choosePlan} />
        </>
      ) : (
        <View style={styles.previewNote}>
          {manageUrl ? <Button label="Manage or cancel in store" variant="ghost" onPress={() => { void Linking.openURL(manageUrl); }} /> : <AppText variant="caption" color={colors.textSecondary}>This access is not linked to an app-store subscription.</AppText>}
        </View>
      )}

      <AppText variant="subtitle" style={styles.featuresTitle}>Features</AppText>
      <View style={styles.featureList}>
        {['Full contact directory', 'All challenge track details'].map((feature) => (
          <View key={feature} style={styles.feature}>
            <Ionicons name="checkmark-circle" size={18} color={colors.accentLime} />
            <AppText variant="body">{feature}</AppText>
          </View>
        ))}
      </View>
    </Screen>
  );
}

export function NotificationsScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'Notifications'>) {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const queryKey = ['notificationPrefs', userId] as const;
  const prefsQuery = useQuery({ queryKey, queryFn: () => fetchNotificationPrefs(userId!), enabled: Boolean(userId) });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const prefs = prefsQuery.data ?? defaultNotificationPrefs;

  async function changePref(field: keyof NotificationPrefs, value: boolean) {
    if (!userId || saving || prefsQuery.isPending || prefsQuery.isError) return;
    const previous = prefs;
    const next = { ...prefs, [field]: value };
    setSaveError(false);
    setSaving(true);
    queryClient.setQueryData(queryKey, next);
    try {
      await updateNotificationPrefs(userId, next);
    } catch {
      queryClient.setQueryData(queryKey, previous);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return <Screen>
    <Back onPress={() => navigation.goBack()} />
    <AppText variant="title">Notifications</AppText>
    <View style={styles.settings}>
      <AppText variant="label" color={colors.textTertiary} style={styles.emailLabel}>EMAIL</AppText>
      <Setting label="Weekly Progress" value={prefs.weeklyProgress} disabled={saving || prefsQuery.isPending || prefsQuery.isError} onValueChange={(value) => changePref('weeklyProgress', value)} />
      <Setting label="Challenge Reminders" value={prefs.challengeReminders} disabled={saving || prefsQuery.isPending || prefsQuery.isError} onValueChange={(value) => changePref('challengeReminders', value)} />
    </View>
    {prefsQuery.isError ? <Pressable onPress={() => prefsQuery.refetch()}><AppText variant="caption" color={colors.danger}>Couldn't load preferences. Tap to retry.</AppText></Pressable> : null}
    {saveError ? <AppText variant="caption" color={colors.danger}>Couldn't save preferences. Please try again.</AppText> : null}
  </Screen>;
}

function Setting({ label, value, disabled, onValueChange }: { label: string; value: boolean; disabled: boolean; onValueChange: (value: boolean) => void }) { return <View style={styles.setting}><AppText variant="bodyStrong">{label}</AppText><Switch value={value} disabled={disabled} onValueChange={onValueChange} trackColor={{ true: colors.accent, false: colors.borderStrong }} thumbColor={colors.textPrimary} /></View>; }
const styles = StyleSheet.create({ back: { marginBottom: spacing.md, marginLeft: -spacing.sm }, form: { gap: spacing.md, marginTop: spacing.lg }, intro: { marginTop: spacing.sm }, settings: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }, setting: { paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }, editAvatar: { alignItems: 'center', marginTop: spacing.lg }, avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentAmber, alignItems: 'center', justifyContent: 'center' }, previewNote: { marginTop: spacing.md }, planCard: { gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: 16, marginTop: spacing.md }, planOptions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }, planOption: { flex: 1, minHeight: 116, justifyContent: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.sm }, planOptionSelected: { borderColor: colors.accentLime, backgroundColor: colors.accentFaint }, featuresTitle: { marginTop: spacing.lg, marginBottom: spacing.sm }, featureList: { gap: spacing.sm }, feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, emailLabel: { paddingTop: spacing.md, paddingBottom: spacing.sm } });
