import { createClient } from 'npm:@supabase/supabase-js@2';
import { parseSubscriberSnapshot } from '../_shared/revenuecat.ts';

function json(status: number, message: string): Response {
  return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
}

function csv(name: string): string[] {
  return (Deno.env.get(name) ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return json(405, 'Method not allowed');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const revenueCatApiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  const expectedEnvironment = Deno.env.get('REVENUECAT_ENVIRONMENT');
  const monthlyIds = csv('REVENUECAT_MONTHLY_PRODUCT_IDS');
  const annualIds = csv('REVENUECAT_ANNUAL_PRODUCT_IDS');
  if (!supabaseUrl || !anonKey || !serviceKey || !revenueCatApiKey || !monthlyIds.length || !annualIds.length ||
      (expectedEnvironment !== 'SANDBOX' && expectedEnvironment !== 'PRODUCTION')) return json(503, 'Billing is not configured');
  const authorization = request.headers.get('Authorization');
  if (!authorization?.startsWith('Bearer ')) return json(401, 'Missing session');
  const caller = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authorization } } });
  const { data: authData, error: authError } = await caller.auth.getUser();
  if (authError || !authData.user) return json(401, 'Invalid session');
  const userId = authData.user.id;
  const { data: claimed, error: claimError } = await caller.rpc('claim_billing_reconcile');
  if (claimError) return json(503, 'Could not request reconciliation');
  if (!claimed) return json(429, 'Please wait before trying again');

  const subscriberResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
    headers: { Authorization: `Bearer ${revenueCatApiKey}` },
  });
  if (!subscriberResponse.ok) return json(503, 'RevenueCat lookup unavailable');
  let snapshot;
  try {
    snapshot = parseSubscriberSnapshot(await subscriberResponse.json(), 'pro', monthlyIds, annualIds, expectedEnvironment, null);
  } catch {
    return json(503, 'Subscriber state could not be verified');
  }
  const admin = createClient(supabaseUrl, serviceKey);
  const { error: applyError } = await admin.rpc('apply_billing_snapshot', {
    p_event_id: `reconcile:${userId}:${snapshot.snapshotAt}`,
    p_event_type: 'RECONCILE',
    p_event_occurred_at: snapshot.snapshotAt,
    p_user_id: userId,
    p_plan: snapshot.plan,
    p_product_id: snapshot.productId,
    p_platform: snapshot.platform,
    p_environment: snapshot.environment,
    p_state: snapshot.state,
    p_active_until: snapshot.activeUntil,
    p_will_renew: snapshot.willRenew,
    p_original_transaction_id: snapshot.originalTransactionId,
    p_snapshot_at: snapshot.snapshotAt,
  });
  if (applyError) return json(503, 'Billing state update failed');
  return json(200, 'Reconciled');
});
