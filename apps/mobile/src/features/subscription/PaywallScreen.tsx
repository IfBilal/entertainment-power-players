import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Logo, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';
import { activatePreviewPlan, fetchPremiumAccess, requestBillingReconcile } from '../../services/supabase/billing';
import { billingIsConfigured, getBillingPlans, purchaseBillingPlan, restoreBillingPurchases, type PlanKind } from '../../services/billing/revenuecat';
import { useAppStore } from '../../store/useAppStore';
import { useAuthStore } from '../../store/useAuthStore';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const benefits = ['Full contact directory', 'All challenge track details'];
// Demo/test unlock: available in dev, or in any build that explicitly opts in
// via EXPO_PUBLIC_ENABLE_TEST_PURCHASES (set for the client-facing preview
// APK, which has no RevenueCat key). The `!billingIsConfigured()` guard is
// load-bearing, not redundant -- it means this can never fire in a real
// release build that *does* have RevenueCat configured, even if the env flag
// were left on by mistake.
const testPurchasesRequested = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_TEST_PURCHASES === 'true';
const previewPurchasesEnabled = testPurchasesRequested && !billingIsConfigured();

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
/**
 * Test-mode checkout only (previewPurchasesEnabled): walks the same shape as
 * a real purchase -- review the order, confirm, a processing wait, then a
 * success screen -- without drawing a fake Apple Pay/Google Pay sheet, which
 * would misrepresent whose UI it is. The real store path below skips this
 * entirely and hands off to the platform's own purchase sheet, which is
 * already the real thing.
 */
type CheckoutStage = 'plans' | 'review' | 'processing' | 'success';

export function PaywallScreen({ navigation, route }: Props) {
  const [plan, setPlan] = useState<PlanKind>(route.params?.plan ?? 'annual');
  const [activating, setActivating] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkoutStage, setCheckoutStage] = useState<CheckoutStage>('plans');
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
      // A webhook may arrive later; ask the authenticated server to verify
      // this caller directly so the paywall need not trust CustomerInfo.
      try { await requestBillingReconcile(); } catch { /* webhook/polling fallback */ }
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

  async function confirmTestPurchase() {
    setCheckoutStage('processing');
    try {
      // The delay is cosmetic -- it's what makes this read as a purchase
      // happening rather than a settings toggle flipping. The entitlement
      // call right after it is the real, server-verified grant.
      await new Promise((resolve) => setTimeout(resolve, 900));
      await activatePreviewPlan(plan);
      if (await fetchPremiumAccess()) {
        setIsPro(true);
        setCheckoutStage('success');
      } else {
        throw new Error('Server has not confirmed test access yet.');
      }
    } catch (error) {
      setCheckoutStage('review');
      Alert.alert(
        'Could not activate test Premium',
        error instanceof Error ? error.message : 'Please try again.',
      );
    }
  }

  async function subscribe() {
    if (previewPurchasesEnabled) {
      setCheckoutStage('review');
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

  const planLabel = plan === 'annual' ? 'Annual' : 'Monthly';
  const planPeriod = plan === 'annual' ? '/ year' : '/ month';

  if (previewPurchasesEnabled && checkoutStage === 'review') {
    return (
      <Screen padded={false}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Pressable accessibilityRole="button" accessibilityLabel="Back to plans" onPress={() => setCheckoutStage('plans')} style={styles.close}><Ionicons name="chevron-back" size={24} color={colors.textSecondary} /></Pressable>
          <AppText variant="display" style={styles.headline}>Review your order</AppText>

          <View style={styles.orderCard}>
            <View style={styles.orderRow}><AppText variant="body" color={colors.textSecondary}>Plan</AppText><AppText variant="bodyStrong">{planLabel}</AppText></View>
            <View style={styles.orderRow}><AppText variant="body" color={colors.textSecondary}>Price</AppText><AppText variant="bodyStrong">Test plan {planPeriod}</AppText></View>
            <View style={[styles.orderRow, styles.orderDivider]}>
              <AppText variant="body" color={colors.textSecondary}>Payment method</AppText>
              <AppText variant="bodyStrong">Test card · no charge</AppText>
            </View>
          </View>

          <AppText variant="caption" color={colors.accentLime} style={styles.testNotice}>
            This is the demo preview build: confirming activates Premium through the server, like a real purchase would, but no payment method is charged.
          </AppText>

          <Button label="Confirm & Pay (Test)" size="lg" onPress={() => { void confirmTestPurchase(); }} />
          <View style={styles.footerLinks}>
            <Button label="Back" variant="ghost" onPress={() => setCheckoutStage('plans')} />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (previewPurchasesEnabled && checkoutStage === 'processing') {
    return (
      <Screen>
        <View style={styles.centeredStage}>
          <ActivityIndicator size="large" color={colors.accent} />
          <AppText variant="subtitle" style={styles.processingText}>Processing your test payment…</AppText>
        </View>
      </Screen>
    );
  }

  if (previewPurchasesEnabled && checkoutStage === 'success') {
    return (
      <Screen>
        <View style={styles.centeredStage}>
          <View style={styles.successIcon}><Ionicons name="checkmark" size={40} color={colors.textInverse} /></View>
          <AppText variant="display" style={styles.processingText}>You&apos;re Premium!</AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.successBody}>
            {planLabel} test plan activated. No payment was taken.
          </AppText>
          <Button label="Continue" size="lg" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    );
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
            Demo preview build: you&apos;ll review your order next, like a real purchase, but nothing is charged.
          </AppText>
        ) : null}
        <Button
          label={confirming ? 'Confirming access…' : activating ? 'Processing…' : previewPurchasesEnabled ? 'Continue' : 'Subscribe'}
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
  orderCard: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.md, marginTop: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderDivider: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm, marginTop: spacing.xs },
  centeredStage: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.md },
  processingText: { textAlign: 'center' },
  successIcon: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentLime, alignItems: 'center', justifyContent: 'center' },
  successBody: { textAlign: 'center', marginBottom: spacing.md },
});
