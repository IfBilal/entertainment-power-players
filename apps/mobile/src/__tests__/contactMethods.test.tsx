import { fireEvent, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 }]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => [{ id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe', categorySlug: 'fashion', role: 'Stylist', city: 'New York' }]),
  fetchContactById: jest.fn(async () => ({ id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe', categorySlug: 'fashion', role: 'Stylist', city: 'New York', phone: '+1 555 0100', email: 'jane@example.com', website: 'example.com' })),
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

it('shows a recoverable error when a contact method cannot open', async () => {
  useAppStore.setState({ isPro: true });
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  const openURL = jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no handler'));
  try {
    await renderWithProviders(<RootNavigator />);
    fireEvent.press(await screen.findByLabelText('Directory'));
    fireEvent.press(await screen.findByLabelText('Fashion category, 1 contact'));
    expect(await screen.findByLabelText('Fashion category')).toBeTruthy();
    expect(screen.getByLabelText('Jump to J').props.accessibilityState?.disabled).toBeFalsy();
    expect(screen.getByLabelText('Jump to Z').props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(await screen.findByText('Jane Doe'));
    fireEvent.press(await screen.findByText('Call'));

    expect(await screen.findByText('Could not open Call. Check that an app is available and try again.')).toBeTruthy();
    fireEvent.press(screen.getByText('Website'));
    expect(openURL).toHaveBeenCalledWith('https://example.com');
    useAppStore.setState({ isPro: false });
    expect(await screen.findByText('Unlock contact details')).toBeTruthy();
  } finally {
    openURL.mockRestore();
  }
});
