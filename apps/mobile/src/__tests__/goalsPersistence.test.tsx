import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { TrackerNavigator } from '../features/tracker/TrackerNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { saveWeeklyGoals } from '../services/supabase/goals';
import type { WeeklyGoals } from '../services/mock/tracker';

const mockGoals: Record<string, WeeklyGoals> = {};

jest.mock('../services/supabase/activity', () => ({
  activityQueryKey: (userId: string | null) => ['activity', userId],
  fetchUserActivity: jest.fn(async () => []),
}));

jest.mock('../services/supabase/goals', () => {
  const actual = jest.requireActual('../services/supabase/goals');
  return {
    ...actual,
    fetchUserGoals: jest.fn(async () => ({ ...mockGoals })),
    saveWeeklyGoals: jest.fn(async (_userId: string, weekKey: string, goals: WeeklyGoals) => {
      mockGoals[weekKey] = goals;
    }),
  };
});

it('saves weekly goals and restores them after reopening Tracker', async () => {
  for (const key of Object.keys(mockGoals)) delete mockGoals[key];
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });

  const visit = await renderWithProviders(<TrackerNavigator />);
  fireEvent.press(await screen.findByLabelText('Edit weekly goals'));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Save goals' }).props.accessibilityState?.disabled).toBe(false));
  fireEvent.changeText(await screen.findByDisplayValue('5'), '7');
  await waitFor(() => expect(screen.getByDisplayValue('7')).toBeTruthy());
  fireEvent.press(screen.getByRole('button', { name: 'Save goals' }));
  await waitFor(() => expect(saveWeeklyGoals).toHaveBeenCalledTimes(1));
  expect(Object.values(mockGoals)[0]).toEqual({ contacts: 7, events: 2, followUps: 3 });
  await waitFor(() => expect(screen.getByTestId('tracker-progress-copy')).toHaveTextContent(/0\/7/));

  visit.unmount();
  await renderWithProviders(<TrackerNavigator />);
  await waitFor(() => expect(screen.getByTestId('tracker-progress-copy')).toHaveTextContent(/0\/7/));
});
