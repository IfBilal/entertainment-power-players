export type BillingSnapshot = {
  plan: 'monthly' | 'annual' | null;
  productId: string | null;
  platform: 'apple' | 'google' | null;
  environment: 'SANDBOX' | 'PRODUCTION' | null;
  state: 'free' | 'trial' | 'active' | 'cancelled' | 'expired';
  activeUntil: string | null;
  willRenew: boolean | null;
  originalTransactionId: string | null;
  snapshotAt: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value);
}

export function hasAmbiguousIdentity(event: Record<string, unknown>, userId: string): boolean {
  const identities = [event.app_user_id, event.original_app_user_id, ...(Array.isArray(event.aliases) ? event.aliases : [])];
  return identities.some((identity) => isUuid(identity) && identity.toLowerCase() !== userId.toLowerCase());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function dateMs(value: unknown): number {
  return typeof value === 'string' ? Date.parse(value) : NaN;
}

export function parseSubscriberSnapshot(
  response: unknown,
  entitlementId: string,
  monthlyIds: string[],
  annualIds: string[],
  expectedEnvironment: 'SANDBOX' | 'PRODUCTION',
  originalTransactionId: string | null,
): BillingSnapshot {
  const root = isRecord(response) && isRecord(response.value) ? response.value : response;
  if (!isRecord(root) || !isRecord(root.subscriber)) throw new Error('Invalid RevenueCat subscriber response');
  const subscriber = root.subscriber;
  const entitlements = isRecord(subscriber.entitlements) ? subscriber.entitlements : {};
  const entitlement = entitlements[entitlementId];
  const snapshotMs = typeof root.request_date_ms === 'number' && Number.isFinite(new Date(root.request_date_ms).getTime()) ? root.request_date_ms : Date.now();
  const snapshotAt = new Date(snapshotMs).toISOString();
  if (!isRecord(entitlement)) return {
    plan: null, productId: null, platform: null, environment: null,
    state: 'expired', activeUntil: null, willRenew: false,
    originalTransactionId, snapshotAt,
  };

  const productId = entitlement.product_identifier;
  if (typeof productId !== 'string') throw new Error('Missing RevenueCat product');
  const plan = monthlyIds.includes(productId) ? 'monthly' : annualIds.includes(productId) ? 'annual' : null;
  if (!plan) throw new Error('Unexpected RevenueCat product');
  const subscriptions = isRecord(subscriber.subscriptions) ? subscriber.subscriptions : {};
  const subscription = subscriptions[productId];
  if (!isRecord(subscription)) throw new Error('Missing RevenueCat subscription details');
  const platform = subscription.store === 'app_store' ? 'apple' : subscription.store === 'play_store' ? 'google' : null;
  if (!platform) throw new Error('Unexpected RevenueCat store');
  const environment = subscription.is_sandbox === true ? 'SANDBOX' : 'PRODUCTION';
  if (environment !== expectedEnvironment) throw new Error('RevenueCat environment mismatch');

  const expiresMs = dateMs(entitlement.expires_date);
  const graceMs = dateMs(entitlement.grace_period_expires_date);
  const effectiveEndMs = Math.max(Number.isFinite(expiresMs) ? expiresMs : 0, Number.isFinite(graceMs) ? graceMs : 0);
  const active = effectiveEndMs > snapshotMs && !subscription.refunded_at;
  const cancelled = Boolean(subscription.unsubscribe_detected_at);
  const state = active ? cancelled ? 'cancelled' : subscription.period_type === 'trial' ? 'trial' : 'active' : 'expired';
  return {
    plan, productId, platform, environment, state,
    activeUntil: effectiveEndMs ? new Date(effectiveEndMs).toISOString() : null,
    willRenew: active ? !cancelled : false,
    originalTransactionId,
    snapshotAt,
  };
}

export async function verifyWebhookSignature(rawBody: Uint8Array, header: string | null, secret: string, nowSeconds = Math.floor(Date.now() / 1000)): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map((piece) => piece.trim().split('=', 2)));
  const timestamp = Number(parts.t);
  const signature = parts.v1;
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 300 || !signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const prefix = new TextEncoder().encode(`${timestamp}.`);
  const message = new Uint8Array(prefix.length + rawBody.length);
  message.set(prefix);
  message.set(rawBody, prefix.length);
  const digest = new Uint8Array(await crypto.subtle.sign('HMAC', key, message));
  let difference = 0;
  for (let i = 0; i < digest.length; i += 1) difference |= digest[i] ^ Number.parseInt(signature.slice(i * 2, i * 2 + 2), 16);
  return difference === 0;
}
