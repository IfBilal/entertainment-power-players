import { screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';

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

/**
 * RootNavigator decides Onboarding vs Main purely from auth state:
 * signed in AND at least one track picked == fully onboarded. These pin that
 * rule, since getting it wrong either locks a real user out of the app or
 * lets an unauthenticated one into it.
 *
 * `hydrated: true` prevents hydrate() from starting a real Supabase session
 * lookup during the test.
 */
describe('RootNavigator auth routing', () => {
  it('shows Onboarding (Splash) while auth state is still loading', async () => {
    useAuthStore.setState({ status: 'loading', userId: null, selectedTrackSlugs: null, hydrated: true });
    await renderWithProviders(<RootNavigator />);
    expect(screen.getByText('Power Players')).toBeTruthy();
  });

  it('shows Onboarding when signed out', async () => {
    useAuthStore.setState({ status: 'signedOut', userId: null, selectedTrackSlugs: null, hydrated: true });
    await renderWithProviders(<RootNavigator />);
    expect(screen.getByText('Power Players')).toBeTruthy();
  });

  it('keeps a signed-in user with no tracks picked in Onboarding, not Main', async () => {
    useAuthStore.setState({ status: 'signedIn', userId: 'u1', selectedTrackSlugs: [], hydrated: true });
    await renderWithProviders(<RootNavigator />);
    expect(screen.getByText('Power Players')).toBeTruthy();
    expect(screen.queryByText('Who you should know')).toBeNull();
  });

  it('shows Main once signed in with at least one track picked', async () => {
    useAuthStore.setState({ status: 'signedIn', userId: 'u1', selectedTrackSlugs: ['fashion'], hydrated: true });
    await renderWithProviders(<RootNavigator />);
    expect(await screen.findByText('Who you should know')).toBeTruthy();
  });
});
