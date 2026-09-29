import { Pressable, Text } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { useChallengeActions } from '../hooks/useChallengeActions';
import type { ChallengeProgressMap } from '../services/mock/challenges';
import type { ChallengeRecord } from '../types/week3';

const mockProgress: ChallengeProgressMap = {};
jest.mock('../services/supabase/challenges', () => ({
  challengeProgressQueryKey: (userId: string | null) => ['challengeProgress', userId],
  fetchChallengeProgress: jest.fn(async () => ({ ...mockProgress })),
  transitionChallenge: jest.fn(async (challenge: ChallengeRecord, action: string, note: string | undefined) => {
    await Promise.resolve();
    const current = mockProgress[challenge.id] ?? { status: 'not_started' as const, count: 0 };
    const count = challenge.type === 'single'
      ? action === 'toggle' ? (current.status === 'complete' ? 0 : 1) : current.count
      : Math.max(0, Math.min(challenge.target ?? 1, current.count + (action === 'increment' ? 1 : action === 'decrement' ? -1 : 0)));
    const complete = count === (challenge.type === 'single' ? 1 : challenge.target);
    const saved = { status: complete ? 'complete' as const : 'not_started' as const, count, note, completedAt: complete ? new Date().toISOString() : undefined };
    mockProgress[challenge.id] = saved;
    return saved;
  }),
}));

function Harness() {
  const single = useChallengeActions({ id: 'creators-producers_1', trackSlug: 'creators-producers', order: 1, title: 'Create Something New', description: '', type: 'single', target: null, active: true });
  const counter = useChallengeActions({ id: 'creators-producers_3', trackSlug: 'creators-producers', order: 3, title: 'Find 3 POWER PLAYERS', description: '', type: 'counter', target: 3, active: true });
  return <>
    <Text>{single.disabled || counter.disabled ? 'Loading' : 'Ready'}</Text>
    <Pressable onPress={() => { single.saveNote('Drafted a pitch'); single.complete('Drafted a pitch'); }}><Text>Note and complete</Text></Pressable>
    <Pressable onPress={() => { counter.act('increment'); counter.act('increment'); counter.act('increment'); }}><Text>Rapid increments</Text></Pressable>
  </>;
}

it('serializes note/completion and rapid counter taps against fresh saved state', async () => {
  for (const key of Object.keys(mockProgress)) delete mockProgress[key];
  useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });
  await renderWithProviders(<Harness />);
  await screen.findByText('Ready');
  fireEvent.press(screen.getByText('Note and complete'));
  fireEvent.press(screen.getByText('Rapid increments'));
  await waitFor(() => expect(mockProgress['creators-producers_1']).toEqual(expect.objectContaining({ status: 'complete', note: 'Drafted a pitch' })));
  await waitFor(() => expect(mockProgress['creators-producers_3']).toEqual(expect.objectContaining({ status: 'complete', count: 3 })));
});
