import { fireEvent, screen } from '@testing-library/react-native';
import { MainTabNavigator } from '../navigation/MainTabNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';

// Directory screens now read live data. Stub the service so these navigation
// tests stay deterministic and offline -- what's under test here is that every
// tab mounts and is reachable, not the data layer.
jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [
    { slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 },
  ]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 3 })),
  fetchContactsByCategory: jest.fn(async () => []),
  fetchContactById: jest.fn(async () => null),
  fetchFavoriteContactIds: jest.fn(async () => []),
  addFavorite: jest.fn(async () => undefined),
  removeFavorite: jest.fn(async () => undefined),
  logContactedActivity: jest.fn(async () => undefined),
}));

describe('MainTabNavigator', () => {
  beforeEach(() => {
    useAuthStore.setState({
      status: 'signedIn',
      userId: 'test-user',
      selectedTrackSlugs: ['fashion'],
      hydrated: true,
    });
  });

  it('renders all five tabs and each is reachable', async () => {
    await renderWithProviders(<MainTabNavigator />);

    // Directory is the initial tab — its screen heading confirms it rendered.
    expect(await screen.findByText('People worth knowing.')).toBeTruthy();

    for (const tab of ['Tracker', 'Challenges', 'Inspiration', 'Profile']) {
      fireEvent.press(screen.getByText(tab));
    }

    // Profile tab renders its "SUBSCRIPTION" section once selected.
    expect(await screen.findByText('SUBSCRIPTION')).toBeTruthy();
  });
});
