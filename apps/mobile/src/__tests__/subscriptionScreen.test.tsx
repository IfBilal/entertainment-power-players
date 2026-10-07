import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { SubscriptionScreen } from '../features/profile/ProfileSettingsScreens';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { renderWithProviders } from '../testing/renderWithProviders';
import { fetchSubscriptionStatus } from '../services/supabase/billing';

jest.mock('../services/supabase/billing', () => ({
  fetchSubscriptionStatus: jest.fn(),
}));

const mockFetchStatus = fetchSubscriptionStatus as jest.Mock;

function renderScreen() {
  const navigate = jest.fn();
  const getParent = jest.fn(() => ({ getParent: () => ({ navigate }) }));
  return {
    navigate,
    render: renderWithProviders(
      <SubscriptionScreen navigation={{ navigate, getParent, goBack: jest.fn() } as never} route={{ key: 'sub', name: 'Subscription' }} />,
    ),
  };
}

describe('SubscriptionScreen', () => {
  beforeEach(() => {
    mockFetchStatus.mockReset();
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });
  });

  it('shows Free and routes to the paywall when the member has no plan', async () => {
    useAppStore.setState({ isPro: false });
    mockFetchStatus.mockResolvedValue(null);
    const { navigate, render } = renderScreen();
    await render;
    expect(await screen.findByText('Free')).toBeTruthy();
    fireEvent.press(screen.getByText('Choose a plan'));
    expect(navigate).toHaveBeenCalledWith('Paywall');
  });

  it('labels test-mode access honestly: no store subscription to manage', async () => {
    useAppStore.setState({ isPro: true });
    mockFetchStatus.mockResolvedValue(null);
    await renderScreen().render;
    expect(await screen.findByText('This access is not linked to an app-store subscription.')).toBeTruthy();
    expect(screen.queryByText('Manage or cancel in store')).toBeNull();
  });

  it('reports historical trial state truthfully without offering a new trial', async () => {
    useAppStore.setState({ isPro: true });
    mockFetchStatus.mockResolvedValue({
      userId: 'test-user', plan: 'monthly', productId: 'p', platform: 'apple',
      state: 'trial', activeUntil: '2027-01-01T00:00:00.000Z', willRenew: true, lastReconciledAt: null,
    });
    await renderScreen().render;
    expect(await screen.findByText(/Trial/)).toBeTruthy();
    expect(screen.queryByText(/start.*trial/i)).toBeNull();
    expect(screen.getByText('Manage or cancel in store')).toBeTruthy();
  });

  it('shows cancelled access through the paid period, and a renewing active plan', async () => {
    useAppStore.setState({ isPro: true });
    mockFetchStatus.mockResolvedValue({
      userId: 'test-user', plan: 'annual', productId: 'p', platform: 'google',
      state: 'cancelled', activeUntil: '2027-03-15T00:00:00.000Z', willRenew: false, lastReconciledAt: null,
    });
    await renderScreen().render;
    expect(await screen.findByText(/Cancelled/)).toBeTruthy();
    expect(screen.getByText('Annual')).toBeTruthy();
  });

  it('offers a retry when billing status fails to load', async () => {
    useAppStore.setState({ isPro: true });
    mockFetchStatus.mockRejectedValueOnce(new Error('network')).mockResolvedValueOnce(null);
    await renderScreen().render;
    const retry = await screen.findByText('Billing details unavailable. Tap to retry.');
    fireEvent.press(retry);
    await waitFor(() => expect(mockFetchStatus).toHaveBeenCalledTimes(2));
  });
});
