import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { hasAmbiguousIdentity, parseSubscriberSnapshot, verifyWebhookSignature } from '../functions/_shared/revenuecat.ts';

function payload(overrides = {}) {
  return {
    request_date_ms: Date.parse('2026-09-30T12:00:00Z'),
    subscriber: {
      entitlements: { pro: { product_identifier: 'epp_monthly', expires_date: '2026-10-30T12:00:00Z', grace_period_expires_date: null } },
      subscriptions: { epp_monthly: { store: 'play_store', is_sandbox: true, period_type: 'normal', unsubscribe_detected_at: null, refunded_at: null } },
    },
    ...overrides,
  };
}

const parse = (body) => parseSubscriberSnapshot(body, 'pro', ['epp_monthly'], ['epp_annual'], 'SANDBOX', 'lineage-1');

test('active, cancellation, expiry and refund are derived from the server snapshot', () => {
  assert.equal(parse(payload()).state, 'active');
  const cancelled = payload();
  cancelled.subscriber.subscriptions.epp_monthly.unsubscribe_detected_at = '2026-09-29T00:00:00Z';
  assert.equal(parse(cancelled).state, 'cancelled');
  assert.equal(parse(cancelled).willRenew, false);
  const expired = payload({ request_date_ms: Date.parse('2026-11-01T12:00:00Z') });
  assert.equal(parse(expired).state, 'expired');
  const refunded = payload();
  refunded.subscriber.subscriptions.epp_monthly.refunded_at = '2026-09-30T12:00:00Z';
  assert.equal(parse(refunded).state, 'expired');
});

test('wrong environment, unknown product and multiple UUID identities cannot grant access', () => {
  const wrongEnvironment = payload();
  wrongEnvironment.subscriber.subscriptions.epp_monthly.is_sandbox = false;
  assert.throws(() => parse(wrongEnvironment), /environment mismatch/);
  const wrongProduct = payload();
  wrongProduct.subscriber.entitlements.pro.product_identifier = 'unconfigured';
  assert.throws(() => parse(wrongProduct), /Unexpected RevenueCat product/);
  assert.equal(hasAmbiguousIdentity({ app_user_id: '11111111-1111-4111-8111-111111111111', aliases: ['22222222-2222-4222-8222-222222222222'] }, '11111111-1111-4111-8111-111111111111'), true);
});

test('HMAC checks raw payload, timestamp window and signature', async () => {
  const body = new TextEncoder().encode('{"api_version":"1.0"}');
  const timestamp = 1_800_000_000;
  const signature = createHmac('sha256', 'secret').update(`${timestamp}.`).update(body).digest('hex');
  assert.equal(await verifyWebhookSignature(body, `t=${timestamp},v1=${signature}`, 'secret', timestamp), true);
  assert.equal(await verifyWebhookSignature(body, `t=${timestamp},v1=${signature}`, 'other', timestamp), false);
  assert.equal(await verifyWebhookSignature(body, `t=${timestamp},v1=${signature}`, 'secret', timestamp + 301), false);
});
