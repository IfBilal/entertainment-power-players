import { Pressable, Text } from 'react-native';
import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { useChallengeActions } from '../hooks/useChallengeActions';
import type { ChallengeProgressMap } from '../services/mock/challenges';

const mockProgress: ChallengeProgressMap = {};
jest.mock('../services/supabase/challenges', () => ({
  challengeProgressQueryKey: (userId: string | null) => ['challengeProgress', userId],
  fetchChallengeProgress: jest.fn(async () => ({ ...mockProgress })),
  saveChallengeProgress: jest.fn(async (_userId: string, slug: string, order: number, next: ChallengeProgressMap[string]) => {
    await Promise.resolve();
    const saved = { ...next, completedAt: next.status === 'complete' ? next.completedAt ?? new Date().toISOString() : undefined };
    mockProgress[`${slug}_${order}`] = saved;
    return saved;
  }),
}));

function Harness() {
  const single = useChallengeActions('creators-producers', { order: 1, title: 'Create Something New', description: '', type: 'single' });
  const counter = useChallengeActions('creators-producers', { order: 3, title: 'Find 3 POWER PLAYERS', description: '', type: 'counter', target: 3 });
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
