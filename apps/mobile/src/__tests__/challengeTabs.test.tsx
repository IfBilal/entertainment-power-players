import { fireEvent, screen } from '@testing-library/react-native';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/content', () => {
  const { testTracks, testChallenges } = jest.requireActual('../testing/mockContent');
  return {
    fetchActiveTracks: jest.fn(async () => testTracks),
    fetchActiveChallenges: jest.fn(async () => testChallenges),
    fetchActiveQuotes: jest.fn(async () => []),
  };
});

jest.mock('../services/supabase/challenges', () => ({
  challengeProgressQueryKey: (userId: string | null) => ['challengeProgress', userId],
  fetchChallengeProgress: jest.fn(async () => ({})),
}));

it('switches between selected tracks and all tracks', async () => {
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['creators-producers'], hydrated: true });
  await renderWithProviders(<ChallengesNavigator />);
  expect(await screen.findByText('Creators + Producers')).toBeTruthy();
  expect(screen.queryByText('Fashion')).toBeNull();
  fireEvent.press(screen.getByText('All Tracks'));
  expect(await screen.findByText('Fashion')).toBeTruthy();
  fireEvent.press(screen.getByText('Fashion'));
  expect(await screen.findByLabelText('Fashion category')).toBeTruthy();
});
