import { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import type { ProfileStackParamList } from '../../navigation/types';
import { useAppStore } from '../../store/useAppStore';

function Back({ onPress }: { onPress: () => void }) { return <Pressable onPress={onPress} hitSlop={10} style={styles.back}><Ionicons name="chevron-back" size={27} color={colors.textPrimary} /></Pressable>; }

export function EditProfileScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'EditProfile'>) {
  const [name, setName] = useState('Bilal Tahir');
  const [bio, setBio] = useState('Aspiring creator, building my next opportunity.');
  return <Screen><Back onPress={() => navigation.goBack()} /><AppText variant="title">Edit Profile</AppText><View style={styles.editAvatar}><View style={styles.avatar}><AppText variant="title" color={colors.textInverse}>BT</AppText><Ionicons name="camera" size={15} color={colors.textInverse} style={styles.camera} /></View></View><View style={styles.form}><FormField label="Full name" value={name} onChangeText={setName} /><FormField label="Email address" value="bilal@example.com" editable={false} /><FormField label="Bio" value={bio} onChangeText={setBio} multiline style={styles.bio} /><Button label="Save Changes" onPress={() => navigation.goBack()} /></View></Screen>;
}

export function SubscriptionScreen({ navigation }: NativeStackScreenProps<ProfileStackParamList, 'Subscription'>) {
  const isPro = useAppStore((state) => state.isPro);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  function choosePlan() {
    navigation.getParent()?.getParent()?.navigate('Paywall', { plan });
  }

  return (
    <Screen>
      <Back onPress={() => navigation.goBack()} />
      <AppText variant="title">Subscription</AppText>
      <View style={styles.planCard}>
        <AppText variant="label" color={colors.textSecondary}>CURRENT PLAN</AppText>
        <AppText variant="title" color={isPro ? colors.accentLime : colors.textPrimary}>{isPro ? 'Premium' : 'Free'}</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {isPro ? 'Your premium access is active.' : 'Choose a plan to unlock premium features.'}
        </AppText>
      </View>

      {!isPro ? (
        <>
          <AppText variant="subtitle" style={styles.featuresTitle}>Choose your plan</AppText>
          <View style={styles.planOptions}>
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel="Annual plan, $49.99 per year"
              accessibilityState={{ selected: plan === 'annual' }}
              onPress={() => setPlan('annual')}
              style={[styles.planOption, plan === 'annual' && styles.planOptionSelected]}
            >
              <AppText variant="bodyStrong">Annual</AppText>
              <AppText variant="title">$49.99</AppText>
              <AppText variant="caption" color={colors.textSecondary}>per year · Save 25%</AppText>
            </Pressable>
            <Pressable
              accessibilityRole="radio"
              accessibilityLabel="Monthly plan, $9.99 per month"
              accessibilityState={{ selected: plan === 'monthly' }}
              onPress={() => setPlan('monthly')}
              style={[styles.planOption, plan === 'monthly' && styles.planOptionSelected]}
            >
              <AppText variant="bodyStrong">Monthly</AppText>
              <AppText variant="title">$9.99</AppText>
              <AppText variant="caption" color={colors.textSecondary}>per month</AppText>
            </Pressable>
          </View>
          <Button label="Choose a plan" onPress={choosePlan} />
        </>
      ) : (
        <Button label="Manage Subscription" onPress={() => undefined} />
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
  const [weekly, setWeekly] = useState(true); const [reminders, setReminders] = useState(true);
  return <Screen><Back onPress={() => navigation.goBack()} /><AppText variant="title">Notifications</AppText><View style={styles.settings}><AppText variant="label" color={colors.textTertiary} style={styles.emailLabel}>EMAIL</AppText><Setting label="Weekly Progress" value={weekly} onValueChange={setWeekly} /><Setting label="Challenge Reminders" value={reminders} onValueChange={setReminders} /></View></Screen>;
}

function Setting({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (value: boolean) => void }) { return <View style={styles.setting}><AppText variant="bodyStrong">{label}</AppText><Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.accent, false: colors.borderStrong }} thumbColor={colors.textPrimary} /></View>; }
const styles = StyleSheet.create({ back: { marginBottom: spacing.md, marginLeft: -spacing.sm }, form: { gap: spacing.md, marginTop: spacing.lg }, intro: { marginTop: spacing.sm }, settings: { marginTop: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border }, setting: { paddingVertical: spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.border }, editAvatar: { alignItems: 'center', marginTop: spacing.lg }, avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentAmber, alignItems: 'center', justifyContent: 'center' }, camera: { position: 'absolute', right: -2, bottom: 0, padding: 4, borderRadius: 20, backgroundColor: colors.accentLime }, bio: { minHeight: 80, textAlignVertical: 'top', paddingTop: 10 }, planCard: { gap: spacing.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: 16, marginTop: spacing.md }, planOptions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }, planOption: { flex: 1, minHeight: 116, justifyContent: 'center', gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: spacing.sm }, planOptionSelected: { borderColor: colors.accentLime, backgroundColor: colors.accentFaint }, featuresTitle: { marginTop: spacing.lg, marginBottom: spacing.sm }, featureList: { gap: spacing.sm }, feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, emailLabel: { paddingTop: spacing.md, paddingBottom: spacing.sm } });
