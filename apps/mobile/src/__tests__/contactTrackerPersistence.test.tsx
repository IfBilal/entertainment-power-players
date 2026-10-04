import { fireEvent, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';

const mockActivityRows: Array<{ id: string; type: 'contact'; title: string; contactId: string; date: string; weekKey: string }> = [];

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'glasses-outline', order: 1 }]),
  fetchCategoryCounts: jest.fn(async () => ({ fashion: 1 })),
  fetchContactsByCategory: jest.fn(async () => [{
    id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe',
    categorySlug: 'fashion', role: 'Casting Director', city: 'New York',
  }]),
  fetchContactById: jest.fn(async () => ({
    id: 'c1', name: 'Jane Doe', nameLower: 'jane doe', sortKey: 'jane doe',
    categorySlug: 'fashion', role: 'Casting Director', city: 'New York',
  })),
  fetchFavoriteContactIds: jest.fn(async () => []),
  addFavorite: jest.fn(async () => undefined),
  removeFavorite: jest.fn(async () => undefined),
}));

jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => [...mockActivityRows]),
  createActivity: jest.fn(async ({ contactId, title, date, weekKey }: { contactId: string; title: string; date: Date; weekKey: string }) => {
    const entry = { id: `activity-${contactId}`, type: 'contact' as const, title, contactId, date: date.toISOString(), weekKey };
    mockActivityRows.push(entry);
    return entry;
  }),
  deleteActivity: jest.fn(async () => undefined),
}));

it('keeps a contact marked as added to Tracker after reopening the app', async () => {
  mockActivityRows.length = 0;
  useAppStore.setState({ isPro: true });
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });

  const firstVisit = await renderWithProviders(<RootNavigator />);
  fireEvent.press(await screen.findByLabelText('Directory'));
  fireEvent.press(await screen.findByText('Fashion'));
  fireEvent.press(await screen.findByText('Jane Doe'));
  fireEvent.press(await screen.findByText('Add to Tracker'));
  expect(await screen.findByText('Added to Tracker')).toBeTruthy();
  expect(mockActivityRows).toHaveLength(1);

  firstVisit.unmount();
  const reopened = await renderWithProviders(<RootNavigator />);
  fireEvent.press(await screen.findByLabelText('Directory'));
  fireEvent.press(await screen.findByText('Fashion'));
  fireEvent.press(await screen.findByText('Jane Doe'));
  expect(await screen.findByText('Added to Tracker')).toBeTruthy();
  reopened.unmount();
});
