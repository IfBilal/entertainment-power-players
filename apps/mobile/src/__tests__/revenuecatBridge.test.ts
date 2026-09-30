import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { getBillingPlans, identifyBillingUser, purchaseBillingPlan, restoreBillingPurchases } from '../services/billing/revenuecat';

jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    logIn: jest.fn(async () => ({})),
    getOfferings: jest.fn(async () => ({ current: { monthly: { identifier: '$rc_monthly' }, annual: { identifier: '$rc_annual' } } })),
    purchasePackage: jest.fn(async () => ({})),
    restorePurchases: jest.fn(async () => ({})),
  },
}));

const firstId = '11111111-1111-4111-8111-111111111111';
const secondId = '22222222-2222-4222-8222-222222222222';

it('uses a signed-in UUID, loads both packages, and switches accounts without anonymous logout', async () => {
  const key = Platform.OS === 'android' ? 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY' : 'EXPO_PUBLIC_REVENUECAT_IOS_KEY';
  process.env[key] = 'public-test-key';
  await expect(identifyBillingUser('someone@example.com')).rejects.toThrow('signed-in account');
  const plans = await getBillingPlans(firstId);
  expect(Purchases.configure).toHaveBeenCalledWith({ apiKey: 'public-test-key', appUserID: firstId });
  expect(plans.monthly?.identifier).toBe('$rc_monthly');
  expect(plans.annual?.identifier).toBe('$rc_annual');
  await getBillingPlans(secondId);
  expect(Purchases.logIn).toHaveBeenCalledWith(secondId);
  await purchaseBillingPlan(secondId, plans.annual!);
  expect(Purchases.purchasePackage).toHaveBeenCalledWith(plans.annual);
  await restoreBillingPurchases(secondId);
  expect(Purchases.restorePurchases).toHaveBeenCalled();
  delete process.env[key];
});

it('treats store cancellation as distinct from a failed purchase', async () => {
  const key = Platform.OS === 'android' ? 'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY' : 'EXPO_PUBLIC_REVENUECAT_IOS_KEY';
  process.env[key] = 'public-test-key';
  (Purchases.purchasePackage as jest.Mock).mockRejectedValueOnce({ userCancelled: true });
  expect(await purchaseBillingPlan(secondId, { identifier: '$rc_monthly' } as never)).toBe('cancelled');
  (Purchases.purchasePackage as jest.Mock).mockRejectedValueOnce(new Error('store offline'));
  await expect(purchaseBillingPlan(secondId, { identifier: '$rc_monthly' } as never)).rejects.toThrow('store offline');
  delete process.env[key];
});
