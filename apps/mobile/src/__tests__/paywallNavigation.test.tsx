import { fireEvent, screen } from '@testing-library/react-native';
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

  it('returns to the exact locked screen it was opened from after subscribing, not to a different tab', async () => {
    await renderWithProviders(<RootNavigator />);

    // Directory tab is the initial tab, showing the category grid.
    fireEvent.press(await screen.findByText('Fashion'));

    // Free user hits the paywall gate on the contact list.
    expect(await screen.findByText('Pro feature')).toBeTruthy();
    fireEvent.press(screen.getByText('See plans'));

    // Root-level paywall modal appears.
    expect(await screen.findByText('Open every door')).toBeTruthy();
    fireEvent.press(screen.getByText('Subscribe'));

    // Back on the Fashion contact list -- now unlocked, not bounced to another tab/screen.
    expect(await screen.findByPlaceholderText('Search by name, company or role')).toBeTruthy();
    expect(screen.queryByText('Pro feature')).toBeNull();
  });

  it('returns to Profile (not Directory) when opened from Profile > Upgrade to Pro', async () => {
    await renderWithProviders(<RootNavigator />);

    // Switch to the Profile tab.
    fireEvent.press(await screen.findByText('Profile'));
    expect(await screen.findByText('Upgrade to Pro')).toBeTruthy();
    fireEvent.press(screen.getByText('Upgrade to Pro'));

    expect(await screen.findByText('Open every door')).toBeTruthy();
    fireEvent.press(screen.getByText('Subscribe'));

    // Should land back on Profile, showing the now-Pro state -- not on Directory.
    expect(await screen.findByText('Renews monthly')).toBeTruthy();
    expect(screen.queryByText('Who you should know')).toBeNull();
  });
});
