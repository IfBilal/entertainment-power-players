import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { completedChallengeEntries, saveChallengeProgress } from '../services/supabase/challenges';
import type { ChallengeProgressMap } from '../services/mock/challenges';

const mockProgress: ChallengeProgressMap = {};

jest.mock('../services/supabase/challenges', () => {
  const actual = jest.requireActual('../services/supabase/challenges');
  return {
    ...actual,
    fetchChallengeProgress: jest.fn(async () => ({ ...mockProgress })),
    saveChallengeProgress: jest.fn(async (_userId: string, trackSlug: string, order: number, next: ChallengeProgressMap[string]) => {
      const saved = { ...next, completedAt: next.status === 'complete' ? next.completedAt ?? new Date().toISOString() : undefined };
      mockProgress[`${trackSlug}_${order}`] = saved;
      return saved;
    }),
  };
});

it('persists a challenge note and completion from its detail screen after reopening', async () => {
  for (const key of Object.keys(mockProgress)) delete mockProgress[key];
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['creators-producers'], hydrated: true });
  useAppStore.setState({ isPro: true });

  const visit = await renderWithProviders(<ChallengesNavigator />);
  fireEvent.press(await screen.findByText('Creators + Producers'));
  fireEvent.press(await screen.findByText('Create Something New'));
  const note = await screen.findByPlaceholderText('Add Note');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark as Complete' }).props.accessibilityState?.disabled).toBe(false));
  fireEvent.changeText(note, 'Drafted a pitch');
  await waitFor(() => expect(screen.getByDisplayValue('Drafted a pitch')).toBeTruthy());
  fireEvent(note, 'blur');
  await waitFor(() => expect(mockProgress['creators-producers_1']?.note).toBe('Drafted a pitch'));
  fireEvent.press(screen.getByRole('button', { name: 'Mark as Complete' }));
  await waitFor(() => expect(mockProgress['creators-producers_1']?.status).toBe('complete'));
  expect(completedChallengeEntries(mockProgress)).toEqual(expect.arrayContaining([expect.objectContaining({ type: 'challenge', notes: 'Drafted a pitch' })]));
  expect(saveChallengeProgress).toHaveBeenCalledWith('test-user', 'creators-producers', 1, expect.objectContaining({ status: 'complete' }));

  visit.unmount();
  await renderWithProviders(<ChallengesNavigator />);
  expect(await screen.findByText('1/10 completed')).toBeTruthy();
});
