import { createClient } from 'npm:@supabase/supabase-js@2';
import { hasAmbiguousIdentity, isUuid, parseSubscriberSnapshot, verifyWebhookSignature } from '../_shared/revenuecat.ts';

type Event = Record<string, unknown>;

function response(status: number, message: string): Response {
  return new Response(JSON.stringify({ message }), { status, headers: { 'Content-Type': 'application/json' } });
}

function equalSecret(actual: string | null, expected: string): boolean {
  if (!actual) return false;
  const a = new TextEncoder().encode(actual);
  const b = new TextEncoder().encode(expected);
  let mismatch = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) mismatch |= (a[i] ?? 0) ^ (b[i] ?? 0);
  return mismatch === 0;
}

function csv(name: string): string[] {
  return (Deno.env.get(name) ?? '').split(',').map((part) => part.trim()).filter(Boolean);
}

Deno.serve(async (request) => {
  if (request.method !== 'POST') return response(405, 'Method not allowed');
  const webhookToken = Deno.env.get('REVENUECAT_WEBHOOK_TOKEN');
  const signingSecret = Deno.env.get('REVENUECAT_WEBHOOK_SIGNING_SECRET');
  const revenueCatApiKey = Deno.env.get('REVENUECAT_SECRET_API_KEY');
  const expectedAppIds = csv('REVENUECAT_APP_IDS');
  const expectedEnvironment = Deno.env.get('REVENUECAT_ENVIRONMENT');
  const monthlyIds = csv('REVENUECAT_MONTHLY_PRODUCT_IDS');
  const annualIds = csv('REVENUECAT_ANNUAL_PRODUCT_IDS');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!webhookToken || !signingSecret || !revenueCatApiKey || !expectedAppIds.length ||
      !monthlyIds.length || !annualIds.length || !supabaseUrl || !serviceKey ||
      (expectedEnvironment !== 'SANDBOX' && expectedEnvironment !== 'PRODUCTION')) {
    return response(503, 'Billing is not configured');
  }
  if (!equalSecret(request.headers.get('Authorization'), webhookToken)) return response(401, 'Unauthorized');
  const rawBody = new Uint8Array(await request.arrayBuffer());
  if (rawBody.length > 256_000) return response(413, 'Payload too large');
  if (!await verifyWebhookSignature(rawBody, request.headers.get('X-RevenueCat-Webhook-Signature'), signingSecret)) {
    return response(401, 'Invalid signature');
  }

  let event: Event;
  try {
    const payload = JSON.parse(new TextDecoder().decode(rawBody));
    if (payload?.api_version !== '1.0' || !payload.event || typeof payload.event !== 'object') return response(400, 'Invalid event');
    event = payload.event as Event;
  } catch {
    return response(400, 'Invalid JSON');
  }
  if (typeof event.id !== 'string' || typeof event.type !== 'string' || typeof event.event_timestamp_ms !== 'number' || !Number.isFinite(new Date(event.event_timestamp_ms).getTime())) return response(400, 'Invalid event fields');
  if (event.type === 'TEST') return response(200, 'Test event acknowledged');
  if (typeof event.app_id !== 'string' || !expectedAppIds.includes(event.app_id)) return response(202, 'Event quarantined: app mismatch');
  if (event.environment !== expectedEnvironment && !(event.type === 'TRANSFER' && event.environment == null)) {
    return response(202, 'Event quarantined: environment mismatch');
  }
  if (Array.isArray(event.entitlement_ids) && !event.entitlement_ids.includes('pro')) return response(200, 'Unrelated entitlement');

  // A transfer never grants a new account. RevenueCat's alias rules can map
  // both IDs to one customer; the source is revoked and destination must
  // authenticate and explicitly reconcile itself after the transfer.
  const identities = event.type === 'TRANSFER'
    ? (Array.isArray(event.transferred_from) ? event.transferred_from : [])
    : [event.app_user_id];
  const userIds = [...new Set(identities.filter(isUuid))];
  if (!userIds.length || (event.type !== 'TRANSFER' && (userIds.length !== 1 || hasAmbiguousIdentity(event, userIds[0])))) {
    return response(202, 'Event quarantined: ambiguous identity');
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const eventAt = new Date(event.event_timestamp_ms).toISOString();
  for (const userId of userIds) {
    const { data: user, error: userError } = await admin.auth.admin.getUserById(userId);
    if (userError || !user.user) return response(202, 'Event quarantined: unknown account');
    if (event.type === 'TRANSFER') {
      const { error: revokeError } = await admin.rpc('apply_billing_snapshot', {
        p_event_id: `${event.id}:revoke:${userId}`,
        p_event_type: 'TRANSFER', p_event_occurred_at: eventAt, p_user_id: userId,
        p_plan: null, p_product_id: null, p_platform: null, p_environment: null,
        p_state: 'expired', p_active_until: null, p_will_renew: false,
        p_original_transaction_id: null, p_snapshot_at: eventAt,
      });
      if (revokeError) return response(503, 'Billing state update failed');
      continue;
    }
    const subscriberResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${revenueCatApiKey}` },
    });
    if (!subscriberResponse.ok) return response(503, 'RevenueCat lookup unavailable');
    let snapshot;
    try {
      snapshot = parseSubscriberSnapshot(
        await subscriberResponse.json(), 'pro', monthlyIds, annualIds,
        expectedEnvironment, typeof event.original_transaction_id === 'string' ? event.original_transaction_id : null,
      );
    } catch {
      return response(202, 'Event quarantined: invalid subscriber state');
    }
    const { error: applyError } = await admin.rpc('apply_billing_snapshot', {
      p_event_id: event.id,
      p_event_type: event.type,
      p_event_occurred_at: eventAt,
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
    if (applyError) return response(503, 'Billing state update failed');
  }
  return response(200, 'Accepted');
});
