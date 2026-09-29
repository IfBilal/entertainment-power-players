import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ProfileNavigator } from '../features/profile/ProfileNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { updateNotificationPrefs } from '../services/supabase/profile';

const mockPrefs = { weeklyProgress: true, challengeReminders: true };

jest.mock('../services/supabase/profile', () => ({
  defaultNotificationPrefs: { weeklyProgress: true, challengeReminders: true },
  fetchNotificationPrefs: jest.fn(async () => ({ ...mockPrefs })),
  updateNotificationPrefs: jest.fn(async (_userId: string, next: typeof mockPrefs) => { Object.assign(mockPrefs, next); }),
  updateSelectedTracks: jest.fn(async () => undefined),
}));

it('saves notification switches and restores them after reopening', async () => {
  mockPrefs.weeklyProgress = true;
  mockPrefs.challengeReminders = true;
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });

  const firstVisit = await renderWithProviders(<ProfileNavigator />);
  fireEvent.press(await screen.findByText('Notifications'));
  await waitFor(() => expect(screen.getAllByRole('switch')[0].props.disabled).toBe(false));
  fireEvent(screen.getAllByRole('switch')[0], 'valueChange', false);
  await waitFor(() => expect(updateNotificationPrefs).toHaveBeenCalledWith('test-user', {
    weeklyProgress: false,
    challengeReminders: true,
  }));
  await waitFor(() => expect(mockPrefs.weeklyProgress).toBe(false));

  firstVisit.unmount();
  await renderWithProviders(<ProfileNavigator />);
  fireEvent.press(await screen.findByText('Notifications'));
  const savedSwitches = await screen.findAllByRole('switch');
  await waitFor(() => expect(savedSwitches[0].props.value).toBe(false));
});
