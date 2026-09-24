import { Alert } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [
    { slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 },
  ]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => [
    {
      id: 'c1',
      name: 'Jane Doe',
      nameLower: 'jane doe',
      sortKey: 'jane doe',
      categorySlug: 'fashion',
      role: 'Casting Director',
      company: 'Example Casting',
    },
  ]),
  fetchContactById: jest.fn(async () => null),
  fetchFavoriteContactIds: jest.fn(async () => []),
  addFavorite: jest.fn(async () => undefined),
  removeFavorite: jest.fn(async () => undefined),
  logContactedActivity: jest.fn(async () => undefined),
}));

describe('Paywall reached from a locked screen (root-level modal)', () => {
  beforeEach(() => {
    useAppStore.setState({ isPro: false });
    // Signed in with tracks already picked == fully onboarded, so
    // RootNavigator renders the Main tabs directly (no Splash/auth wait).
    useAuthStore.setState({
      status: 'signedIn',
      userId: 'test-user',
      selectedTrackSlugs: ['fashion'],
      hydrated: true,
    });
  });

  it('returns to the exact locked screen it was opened from when dismissed', async () => {
    await renderWithProviders(<RootNavigator />);

    // The Directory tab now opens on Home (mockup 9); the category grid is one
    // level in, via Quick Access.
    fireEvent.press(await screen.findByLabelText('Directory'));
    fireEvent.press(await screen.findByText('Fashion'));

    // Free user hits the paywall gate on the contact list.
    expect(await screen.findByText('Your industry network is waiting.')).toBeTruthy();
    fireEvent.press(screen.getByText('Unlock directory'));

    // Root-level paywall modal appears.
    expect(await screen.findByText(/Unlock the full/)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Close paywall'));

    // Back on the Fashion contact list without changing the entitlement.
    expect(await screen.findByText('Your industry network is waiting.')).toBeTruthy();
    expect(useAppStore.getState().isPro).toBe(false);
  });

  it('opens the two plan options from Profile without granting Pro before a purchase', async () => {
    await renderWithProviders(<RootNavigator />);

    // Switch to the Profile tab.
    fireEvent.press(await screen.findByText('Profile'));
    expect(await screen.findByText('Subscription')).toBeTruthy();
    fireEvent.press(screen.getByText('Subscription'));

    expect(await screen.findByText('Monthly')).toBeTruthy();
    expect(screen.getByText('Annual')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Monthly plan, $9.99 per month'));
    await waitFor(() => expect(screen.getByLabelText('Monthly plan, $9.99 per month').props.accessibilityState.selected).toBe(true));
    fireEvent.press(screen.getByText('Choose a plan'));

    expect(await screen.findByText(/Unlock the full/)).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
    expect(screen.getByText('Annual')).toBeTruthy();
    expect(screen.getByLabelText('Monthly plan, $9.99 per month').props.accessibilityState).toEqual({ selected: true });
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    fireEvent.press(screen.getByText('Subscribe'));
    expect(alert).toHaveBeenCalledWith('Purchases are unavailable', expect.any(String));
    expect(useAppStore.getState().isPro).toBe(false);
    alert.mockRestore();
  });

  it('does not grant Pro when the paywall CTA is tapped without a billing provider', async () => {
    await renderWithProviders(<RootNavigator />);
    fireEvent.press(await screen.findByLabelText('Directory'));
    fireEvent.press(await screen.findByText('Fashion'));
    fireEvent.press(await screen.findByText('Unlock directory'));
    await screen.findByText(/Unlock the full/);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    fireEvent.press(screen.getByText('Subscribe'));
    expect(alert).toHaveBeenCalledWith('Purchases are unavailable', expect.any(String));
    expect(useAppStore.getState().isPro).toBe(false);
    alert.mockRestore();
  });

  it('keeps Profile reachable after dismissing the plans sheet', async () => {
    await renderWithProviders(<RootNavigator />);
    fireEvent.press(await screen.findByText('Profile'));
    fireEvent.press(await screen.findByText('Subscription'));
    fireEvent.press(await screen.findByText('Choose a plan'));
    fireEvent.press(await screen.findByLabelText('Close paywall'));
    expect(await screen.findByText('Profile')).toBeTruthy();
    expect(screen.queryByText('Quick Access')).toBeNull();
  });
});
