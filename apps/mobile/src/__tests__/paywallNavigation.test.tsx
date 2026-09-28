import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { activatePreviewPlan } from '../services/supabase/billing';

jest.mock('../services/supabase/billing', () => ({
  activatePreviewPlan: jest.fn(async () => undefined),
}));

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
      city: 'New York',
    },
    {
      id: 'c2',
      name: 'John Smith',
      nameLower: 'john smith',
      sortKey: 'john smith',
      categorySlug: 'fashion',
      role: 'Producer',
      company: 'Second Example',
      city: 'Los Angeles',
    },
  ]),
  fetchContactById: jest.fn(async (id: string) => ({
    id,
    name: id === 'c1' ? 'Jane Doe' : 'John Smith',
    nameLower: id === 'c1' ? 'jane doe' : 'john smith',
    sortKey: id === 'c1' ? 'jane doe' : 'john smith',
    categorySlug: 'fashion',
    role: id === 'c1' ? 'Casting Director' : 'Producer',
    company: id === 'c1' ? 'Example Casting' : 'Second Example',
    // Mimic a detail response without city while the list row already has it.
    city: undefined,
  })),
  fetchFavoriteContactIds: jest.fn(async () => ['c2']),
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

  it('grants the selected preview plan and unlocks contacts after Subscribe', async () => {
    await renderWithProviders(<RootNavigator />);

    fireEvent.press(await screen.findByLabelText('Directory'));
    fireEvent.press(await screen.findByText('Fashion'));
    fireEvent.press(await screen.findByText('Unlock directory'));
    expect(await screen.findByText(/Unlock the full/)).toBeTruthy();
    expect(screen.getByText('Monthly')).toBeTruthy();
    expect(screen.getByText('Annual')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Monthly plan, $9.99 per month'));
    await waitFor(() => expect(screen.getByLabelText('Monthly plan, $9.99 per month').props.accessibilityState.selected).toBe(true));
    fireEvent.press(screen.getByText('Activate Premium (test)'));

    await waitFor(() => expect(activatePreviewPlan).toHaveBeenCalledWith('monthly'));
    await waitFor(() => expect(useAppStore.getState().isPro).toBe(true));
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
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

  it('filters to favorites only and shows city on contact details', async () => {
    useAppStore.setState({ isPro: true });
    await renderWithProviders(<RootNavigator />);

    fireEvent.press(await screen.findByLabelText('Directory'));
    fireEvent.press(await screen.findByText('Fashion'));
    expect(await screen.findByText('Jane Doe')).toBeTruthy();
    expect(await screen.findByText('John Smith')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Filter contacts'));
    fireEvent.press(await screen.findByLabelText('Favorites only'));
    fireEvent.press(screen.getByText('Apply filters'));
    expect(await screen.findByText('John Smith')).toBeTruthy();
    await waitFor(() => expect(screen.queryByText('Jane Doe')).toBeNull());

    fireEvent.press(screen.getByText('John Smith'));
    expect(await screen.findByText('Los Angeles')).toBeTruthy();
  });
});
