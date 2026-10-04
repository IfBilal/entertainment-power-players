import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { transitionChallenge } from '../services/supabase/challenges';
import type { ChallengeProgressMap } from '../services/mock/challenges';
import type { ChallengeRecord } from '../types/week3';

const mockProgress: ChallengeProgressMap = {};
const mockStableChallengeId = 'challenge-db-id-7f3a';

jest.mock('../services/supabase/content', () => {
  const { testTracks, testChallenges } = jest.requireActual('../testing/mockContent');
  return {
    fetchActiveTracks: jest.fn(async () => testTracks),
    fetchActiveChallenges: jest.fn(async () => testChallenges.map((challenge: ChallengeRecord) => (
      challenge.trackSlug === 'creators-producers' && challenge.order === 1
        ? { ...challenge, id: mockStableChallengeId }
        : challenge
    ))),
    fetchActiveQuotes: jest.fn(async () => []),
  };
});

jest.mock('../services/supabase/challenges', () => {
  const actual = jest.requireActual('../services/supabase/challenges');
  return {
    ...actual,
    fetchChallengeProgress: jest.fn(async () => ({ ...mockProgress })),
    transitionChallenge: jest.fn(async (challenge: ChallengeRecord, action: string, note: string | undefined) => {
      const current = mockProgress[challenge.id] ?? { status: 'not_started', count: 0 };
      const complete = action === 'toggle' ? current.status !== 'complete' : current.status === 'complete';
      const saved = {
        status: complete ? 'complete' as const : 'not_started' as const,
        count: complete ? 1 : 0,
        note,
        completedAt: complete ? current.completedAt ?? new Date().toISOString() : undefined,
      };
      mockProgress[challenge.id] = saved;
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
  expect(await screen.findByLabelText('Challenge category: Creators + Producers')).toBeTruthy();
  const note = await screen.findByPlaceholderText('Add Note');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Mark as Complete' }).props.accessibilityState?.disabled).toBe(false));
  fireEvent.changeText(note, 'Drafted a pitch');
  await waitFor(() => expect(screen.getByDisplayValue('Drafted a pitch')).toBeTruthy());
  fireEvent(note, 'blur');
  await waitFor(() => expect(mockProgress[mockStableChallengeId]?.note).toBe('Drafted a pitch'));
  fireEvent.press(screen.getByRole('button', { name: 'Mark as Complete' }));
  await waitFor(() => expect(mockProgress[mockStableChallengeId]?.status).toBe('complete'));
  expect(transitionChallenge).toHaveBeenCalledWith(expect.objectContaining({ id: mockStableChallengeId }), 'toggle', 'Drafted a pitch', expect.any(String));

  visit.unmount();
  await renderWithProviders(<ChallengesNavigator />);
  expect(await screen.findByText('1/10 completed')).toBeTruthy();
});
