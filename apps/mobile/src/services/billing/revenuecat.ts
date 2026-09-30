import { Platform } from 'react-native';
import type { PurchasesPackage } from 'react-native-purchases';

export type PlanKind = 'monthly' | 'annual';
export type BillingPlans = Partial<Record<PlanKind, PurchasesPackage>>;

let configured = false;
let identifiedUserId: string | null = null;

function platformKey(): string | undefined {
  return Platform.OS === 'android'
    ? process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY
    : Platform.OS === 'ios'
      ? process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY
      : undefined;
}

export function billingIsConfigured(): boolean {
  return Boolean(platformKey());
}

/** Never configures anonymous customers: only a signed-in Supabase UUID is accepted. */
export async function identifyBillingUser(userId: string) {
  if (!userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
    throw new Error('Billing requires a signed-in account.');
  }
  const apiKey = platformKey();
  if (!apiKey) throw new Error('Billing is not configured for this platform.');
  // Loading only when a platform key exists keeps the non-billing preview and
  // Jest render path free of native SDK initialization.
  const Purchases = require('react-native-purchases').default as typeof import('react-native-purchases').default;
  if (!configured) {
    Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
    identifiedUserId = userId;
  } else if (identifiedUserId !== userId) {
    await Purchases.logIn(userId);
    identifiedUserId = userId;
  }
  return Purchases;
}

export async function getBillingPlans(userId: string): Promise<BillingPlans> {
  const Purchases = await identifyBillingUser(userId);
  const offerings = await Purchases.getOfferings();
  const current = offerings.current;
  if (!current) return {};
  return { monthly: current.monthly ?? undefined, annual: current.annual ?? undefined };
}

export async function purchaseBillingPlan(userId: string, plan: PurchasesPackage): Promise<'purchased' | 'cancelled'> {
  const Purchases = await identifyBillingUser(userId);
  try {
    await Purchases.purchasePackage(plan);
    return 'purchased';
  } catch (error) {
    if (error && typeof error === 'object' && 'userCancelled' in error && error.userCancelled === true) return 'cancelled';
    throw error;
  }
}

export async function restoreBillingPurchases(userId: string): Promise<void> {
  const Purchases = await identifyBillingUser(userId);
  await Purchases.restorePurchases();
}
