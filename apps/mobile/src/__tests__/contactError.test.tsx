import { fireEvent, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 }]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => [{ id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe', categorySlug: 'fashion', role: 'Stylist' }]),
  fetchContactById: jest.fn(async () => { throw new Error('network unavailable'); }),
  fetchFavoriteContactIds: jest.fn(async () => []),
  addFavorite: jest.fn(async () => undefined),
  removeFavorite: jest.fn(async () => undefined),
}));

jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => []),
  createActivity: jest.fn(async () => undefined),
  deleteActivity: jest.fn(async () => undefined),
}));

it('offers a retry when a contact detail cannot load', async () => {
  useAppStore.setState({ isPro: true });
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  await renderWithProviders(<RootNavigator />);
  fireEvent.press(await screen.findByLabelText('Directory'));
  fireEvent.press(await screen.findByText('Fashion'));
  fireEvent.press(await screen.findByText('Jane Doe'));

  expect(await screen.findByText("Couldn't load contact")).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Try again' })).toBeTruthy();
});
