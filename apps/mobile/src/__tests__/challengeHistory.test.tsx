import { fireEvent, screen } from '@testing-library/react-native';
import { MainTabNavigator } from '../navigation/MainTabNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => []),
  fetchCategoryCounts: jest.fn(async () => ({})),
  fetchFavoriteContactIds: jest.fn(async () => []),
}));
jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => []),
}));
jest.mock('../services/supabase/challenges', () => {
  const actual = jest.requireActual('../services/supabase/challenges');
  return {
    ...actual,
    fetchChallengeProgress: jest.fn(async () => ({
      'creators-producers_1': { status: 'complete', count: 1, note: 'Drafted a pitch', completedAt: new Date().toISOString() },
    })),
  };
});

it('shows saved challenge completion in Tracker Week History without a second activity write', async () => {
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['creators-producers'], hydrated: true });
  await renderWithProviders(<MainTabNavigator />);
  fireEvent.press(await screen.findByLabelText(/^Tracker, tab,/));
  fireEvent.press(await screen.findByLabelText('Week History'));
  expect(await screen.findByText('Completed "Create Something New"')).toBeTruthy();
  expect(await screen.findByText('Drafted a pitch')).toBeTruthy();
});
