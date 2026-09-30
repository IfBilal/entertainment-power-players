import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Logo, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import { activatePreviewPlan, fetchPremiumAccess } from '../../services/supabase/billing';
import { billingIsConfigured, getBillingPlans, purchaseBillingPlan, restoreBillingPurchases, type PlanKind } from '../../services/billing/revenuecat';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const benefits = ['Full contact directory', 'All challenge track details'];
const previewPurchasesEnabled = __DEV__ && !billingIsConfigured();

async function waitForServerAccess(): Promise<boolean> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await fetchPremiumAccess()) return true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  return false;
}

/**
 * The store defines pricing; Supabase's server entitlement defines gated access.
 */
export function PaywallScreen({ navigation, route }: Props) {
  const [plan, setPlan] = useState<PlanKind>(route.params?.plan ?? 'annual');
  const [activating, setActivating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const userId = useAuthStore((state) => state.userId);
  const setIsPro = useAppStore((state) => state.setIsPro);
  const plansQuery = useQuery({
    queryKey: ['billingPlans', userId],
    queryFn: () => getBillingPlans(userId!),
    enabled: !previewPurchasesEnabled && Boolean(userId) && billingIsConfigured(),
    refetchOnMount: 'always',
  });
  const plans = plansQuery.data ?? {};
  const annualSavings = plans.annual && plans.monthly && plans.monthly.product.price > 0 && plans.annual.product.currencyCode === plans.monthly.product.currencyCode
    ? Math.max(0, Math.round((1 - plans.annual.product.price / (plans.monthly.product.price * 12)) * 100))
    : 0;

  async function confirmAccess() {
    setConfirming(true);
    try {
      if (await waitForServerAccess()) {
        setIsPro(true);
        navigation.goBack();
      } else {
        Alert.alert('Purchase received', 'Your store purchase is being verified. Access will appear when the server confirms it. Please try Restore Purchase shortly.');
      }
    } finally {
      setConfirming(false);
    }
  }

  async function subscribe() {
    if (previewPurchasesEnabled) {
      setActivating(true);
      try {
        await activatePreviewPlan(plan);
        if (await fetchPremiumAccess()) {
          setIsPro(true);
          navigation.goBack();
        } else {
          throw new Error('Server has not confirmed test access yet.');
        }
      } catch (error) {
        Alert.alert(
          'Could not activate test Premium',
          error instanceof Error ? error.message : 'Please try again.',
        );
      } finally {
        setActivating(false);
      }
      return;
    }

    if (!userId || !plans[plan] || activating) return;
    setActivating(true);
    try {
      const result = await purchaseBillingPlan(userId, plans[plan]);
      if (result === 'purchased') await confirmAccess();
    } catch (error) {
      Alert.alert('Purchase failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setActivating(false);
    }
  }

  async function restore() {
    if (!userId || !billingIsConfigured()) return;
    setActivating(true);
    try {
      await restoreBillingPurchases(userId);
      await confirmAccess();
    } catch (error) {
      Alert.alert('Restore failed', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setActivating(false);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close paywall" onPress={() => navigation.goBack()} style={styles.close}><Ionicons name="chevron-back" size={24} color={colors.textSecondary} /></Pressable>
        <View style={styles.brand}><Logo variant="mark" width={76} /></View>
        <AppText variant="display" style={styles.headline}>Unlock the full{`\n`}experience</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subheadline}>Get access to the complete directory,{`\n`}challenges and more.</AppText>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={22} color={colors.accentLime} />
              <AppText variant="body">{benefit}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable accessibilityRole="radio" accessibilityLabel="Annual plan" accessibilityState={{ selected: plan === 'annual', disabled: !previewPurchasesEnabled && !plans.annual }} disabled={!previewPurchasesEnabled && !plans.annual} onPress={() => setPlan('annual')} style={[styles.planCard, plan === 'annual' && styles.planSelected]}>
            <AppText variant="bodyStrong">Annual</AppText><AppText variant="title">{previewPurchasesEnabled ? 'Test plan' : plans.annual?.product.priceString ?? 'Unavailable'} <AppText variant="caption">/ year</AppText></AppText>{annualSavings > 0 ? <AppText variant="caption" color={colors.accentLime}>Save {annualSavings}% vs monthly</AppText> : null}
            {plans.annual?.product.introPrice ? <AppText variant="caption" color={colors.textSecondary}>Intro: {plans.annual.product.introPrice.priceString} for {plans.annual.product.introPrice.cycles} {plans.annual.product.introPrice.periodUnit.toLowerCase()} period(s)</AppText> : null}
          </Pressable>
          <Pressable accessibilityRole="radio" accessibilityLabel="Monthly plan" accessibilityState={{ selected: plan === 'monthly', disabled: !previewPurchasesEnabled && !plans.monthly }} disabled={!previewPurchasesEnabled && !plans.monthly} onPress={() => setPlan('monthly')} style={[styles.planCard, plan === 'monthly' && styles.planSelected]}>
            <AppText variant="bodyStrong">Monthly</AppText><AppText variant="title">{previewPurchasesEnabled ? 'Test plan' : plans.monthly?.product.priceString ?? 'Unavailable'} <AppText variant="caption">/ month</AppText></AppText>
            {plans.monthly?.product.introPrice ? <AppText variant="caption" color={colors.textSecondary}>Intro: {plans.monthly.product.introPrice.priceString} for {plans.monthly.product.introPrice.cycles} {plans.monthly.product.introPrice.periodUnit.toLowerCase()} period(s)</AppText> : null}
          </Pressable>
        </View>

        {!previewPurchasesEnabled && !billingIsConfigured() ? <AppText variant="caption" color={colors.danger} style={styles.testNotice}>Billing is not configured for this build. No purchase will be attempted.</AppText> : null}
        {!previewPurchasesEnabled && plansQuery.isPending && billingIsConfigured() ? <AppText variant="caption" color={colors.textSecondary} style={styles.testNotice}>Loading store plans…</AppText> : null}
        {!previewPurchasesEnabled && plansQuery.isError ? <Pressable onPress={() => plansQuery.refetch()}><AppText variant="caption" color={colors.danger} style={styles.testNotice}>Couldn&apos;t load store plans. Tap to retry.</AppText></Pressable> : null}
        {!previewPurchasesEnabled && plansQuery.isSuccess && (!plans.monthly || !plans.annual) ? <AppText variant="caption" color={colors.danger} style={styles.testNotice}>Both monthly and annual store plans are required. Please try again later.</AppText> : null}

        {previewPurchasesEnabled ? (
          <AppText variant="caption" color={colors.accentLime} style={styles.testNotice}>
            Testing mode: activating a plan grants Premium without charging you.
          </AppText>
        ) : null}
        <Button
          label={confirming ? 'Confirming access…' : activating ? 'Processing…' : previewPurchasesEnabled ? 'Activate Premium (test)' : 'Subscribe'}
          size="lg"
          onPress={subscribe}
          disabled={activating || confirming || (!previewPurchasesEnabled && (!plans.monthly || !plans.annual))}
        />
        {!previewPurchasesEnabled ? <AppText variant="caption" color={colors.textSecondary} style={styles.testNotice}>Subscriptions renew automatically unless cancelled through your device’s app store. Your access begins after purchase verification.</AppText> : null}
        <View style={styles.footerLinks}>
          <Button label="Restore Purchase" variant="ghost" onPress={() => { void restore(); }} disabled={activating || confirming || previewPurchasesEnabled || !billingIsConfigured()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  close: { alignSelf: 'flex-start', minHeight: 30, justifyContent: 'center' },
  brand: { alignItems: 'center', marginTop: spacing.md },
  headline: { marginTop: spacing.md, textAlign: 'center' },
  subheadline: { marginTop: spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },
  benefits: { gap: spacing.sm, marginBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  plans: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  planCard: { flex: 1, minHeight: 118, justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  planSelected: { borderColor: colors.accentLime, backgroundColor: 'rgba(111, 209, 59, 0.14)' },
  footerLinks: { alignItems: 'center', marginTop: spacing.xs },
  testNotice: { textAlign: 'center', marginBottom: spacing.sm },
});
