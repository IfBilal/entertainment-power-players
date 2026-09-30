import { supabase } from './client';
import type { SubscriptionStatusRecord } from '../../types/week3';

export type PreviewPlan = 'monthly' | 'annual';

/** Grants the caller a reversible, server-recorded test entitlement. */
export async function activatePreviewPlan(plan: PreviewPlan): Promise<void> {
  const { error } = await supabase.rpc('activate_preview_plan', { p_plan: plan });
  if (error) throw error;
}

/** Returns the caller's effective server-side premium entitlement. */
export async function fetchPremiumAccess(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_pro');
  if (error) throw error;
  return data === true;
}

/** Server verifies the caller's JWT and RevenueCat subscriber; no plan/status input. */
export async function requestBillingReconcile(): Promise<void> {
  const { error } = await supabase.functions.invoke('reconcile-subscription', { body: {} });
  if (error) throw error;
}

export async function fetchSubscriptionStatus(userId: string): Promise<SubscriptionStatusRecord | null> {
  const { data, error } = await supabase.from('subscription_status')
    .select('user_id, plan, product_id, platform, state, active_until, will_renew, last_reconciled_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    userId: data.user_id,
    plan: data.plan,
    productId: data.product_id,
    platform: data.platform,
    state: data.state,
    activeUntil: data.active_until,
    willRenew: data.will_renew,
    lastReconciledAt: data.last_reconciled_at,
  };
}
