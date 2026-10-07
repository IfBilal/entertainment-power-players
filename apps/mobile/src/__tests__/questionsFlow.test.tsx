import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { renderWithProviders } from '../testing/renderWithProviders';
import type { QuestionProgressRecord } from '../services/supabase/questions';

const mockQuestions = [
  { id: 'q1', categorySlug: 'fashion', challengeGroup: 'Know the Industry', number: 1, question: 'Who founded the CFDA?', answer: 'Eleanor Lambert.', why: 'It shaped American fashion.', powerMove: 'Research three current members.' },
  { id: 'q2', categorySlug: 'fashion', challengeGroup: 'Know the Industry', number: 2, question: 'When was NYFW first held?', answer: '1943.', why: 'It began during WWII.', powerMove: 'Trace how it became global.' },
  { id: 'q3', categorySlug: 'fashion', challengeGroup: 'Culture', number: 1, question: 'What is a capsule wardrobe?', answer: 'A small set of versatile pieces.', why: 'It reduces decision fatigue.', powerMove: 'List five pieces you would keep.' },
];

// Keyed by userId, mirrors the server's merge-only-if-unset write rule so
// the test proves the same contract the real touchProgress() implements.
const mockProgressStore: Record<string, Record<string, QuestionProgressRecord>> = {};

// Returns a fresh object each call, matching how the real Supabase client
// always hands back a newly parsed row -- a shared mutated reference here
// would make two still-pending cache writes collapse to the same identity
// and silently fail to notify a subscribed query (not a real-app failure
// mode, but a trap the real fix needs to avoid for this mock to be honest).
function mockTouch(userId: string, questionId: string, field: keyof QuestionProgressRecord): QuestionProgressRecord {
  const byUser = (mockProgressStore[userId] ??= {});
  const existing = byUser[questionId] ?? { questionId, firstOpenedAt: null, revealedAt: null, completedAt: null };
  const updated = existing[field] ? existing : { ...existing, [field]: new Date().toISOString() };
  byUser[questionId] = updated;
  return { ...updated };
}

jest.mock('../services/supabase/questions', () => ({
  fetchActiveQuestions: jest.fn(async () => mockQuestions),
  fetchQuestionProgress: jest.fn(async (userId: string) => mockProgressStore[userId] ?? {}),
  markQuestionOpened: jest.fn(async (userId: string, questionId: string) => mockTouch(userId, questionId, 'firstOpenedAt')),
  revealQuestion: jest.fn(async (userId: string, questionId: string) => mockTouch(userId, questionId, 'revealedAt')),
  completeQuestion: jest.fn(async (userId: string, questionId: string) => mockTouch(userId, questionId, 'completedAt')),
}));
jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => [{ slug: 'fashion', name: 'Fashion', icon: 'shirt-outline', order: 0 }]),
}));
jest.mock('../services/supabase/content', () => ({
  fetchActiveTracks: jest.fn(async () => []),
  fetchActiveChallenges: jest.fn(async () => []),
  fetchActiveQuotes: jest.fn(async () => []),
  fetchDailyQuote: jest.fn(async () => { throw new Error('not used in this test'); }),
  syncProfileTimezone: jest.fn(async () => undefined),
  getDeviceTimeZone: jest.fn(() => 'UTC'),
}));
jest.mock('../services/supabase/challenges', () => ({
  challengeProgressQueryKey: (userId: string | null) => ['challengeProgress', userId],
  fetchChallengeProgress: jest.fn(async () => ({})),
  transitionChallenge: jest.fn(),
}));

describe('Questions: category -> group -> list -> detail -> reveal -> complete', () => {
  afterEach(() => cleanup());

  beforeEach(() => {
    for (const key of Object.keys(mockProgressStore)) delete mockProgressStore[key];
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });
    useAppStore.setState({ isPro: true });
    // A `mockResolvedValueOnce` queued by one test but never consumed (e.g.
    // because the component fetched fewer times than expected) would
    // otherwise leak into the next test's first call.
    jest.requireMock('../services/supabase/questions').fetchActiveQuestions.mockReset().mockResolvedValue(mockQuestions);
    jest.requireMock('../services/supabase/directory').fetchCategories.mockReset().mockResolvedValue([{ slug: 'fashion', name: 'Fashion', icon: 'shirt-outline', order: 0 }]);
  });

  it('shows a locked paywall card instead of questions when not pro', async () => {
    useAppStore.setState({ isPro: false });
    await renderWithProviders(<ChallengesNavigator />);
    fireEvent.press(await screen.findByText('Questions'));
    expect(await screen.findByText('See plans')).toBeTruthy();
    expect(screen.queryByText('Fashion')).toBeNull();
  });

  it('walks category -> group -> list -> detail, reveals, completes, and moves next/previous', async () => {
    await renderWithProviders(<ChallengesNavigator />);

    fireEvent.press(await screen.findByText('Questions'));
    fireEvent.press(await screen.findByText('Fashion'));
    expect(await screen.findByText('Know the Industry')).toBeTruthy();
    expect(screen.getByText('0/2 complete')).toBeTruthy();

    fireEvent.press(screen.getByText('Know the Industry'));
    expect(await screen.findByText('1. Who founded the CFDA?')).toBeTruthy();

    fireEvent.press(screen.getByText('1. Who founded the CFDA?'));
    expect(await screen.findByText('1 of 2')).toBeTruthy();
    expect(screen.getByText('Who founded the CFDA?')).toBeTruthy();
    expect(screen.queryByText('Eleanor Lambert.')).toBeNull();

    fireEvent.press(screen.getByText('Reveal answer'));
    expect(await screen.findByText('Eleanor Lambert.')).toBeTruthy();
    expect(screen.getByText('It shaped American fashion.')).toBeTruthy();
    expect(screen.getByText('Research three current members.')).toBeTruthy();

    fireEvent.press(screen.getByText('Mark complete'));
    expect(await screen.findByText('Completed')).toBeTruthy();

    fireEvent.press(screen.getByText('Next'));
    expect(await screen.findByText('2 of 2')).toBeTruthy();
    expect(screen.getByText('When was NYFW first held?')).toBeTruthy();
    // Opening question 2 is a fresh view: not revealed yet.
    expect(screen.getByText('Reveal answer')).toBeTruthy();

    fireEvent.press(screen.getByText('Previous'));
    // Question 1's reveal/complete state survived the round trip.
    expect(await screen.findByText('1 of 2')).toBeTruthy();
    expect(screen.getByText('Eleanor Lambert.')).toBeTruthy();
    expect(screen.getByText('Completed')).toBeTruthy();
  });

  it('persists progress across a simulated reinstall (fresh mount, same account)', async () => {
    const first = await renderWithProviders(<ChallengesNavigator />);
    fireEvent.press(await screen.findByText('Questions'));
    fireEvent.press(await screen.findByText('Fashion'));
    fireEvent.press(await screen.findByText('Know the Industry'));
    fireEvent.press(await screen.findByText('1. Who founded the CFDA?'));
    fireEvent.press(await screen.findByText('Reveal answer'));
    await screen.findByText('Eleanor Lambert.');
    await first.unmount();

    await renderWithProviders(<ChallengesNavigator />);
    fireEvent.press(await screen.findByText('Questions'));
    fireEvent.press(await screen.findByText('Fashion'));
    expect(await screen.findByText('0/2 complete')).toBeTruthy();
    fireEvent.press(screen.getByText('Know the Industry'));
    fireEvent.press(await screen.findByText('1. Who founded the CFDA?'));
    expect(await screen.findByText('Eleanor Lambert.')).toBeTruthy();
  });

  it('marks a category with no questions honestly, not with fabricated content', async () => {
    const content = jest.requireMock('../services/supabase/questions');
    content.fetchActiveQuestions.mockResolvedValueOnce([]);
    await renderWithProviders(<ChallengesNavigator />);
    fireEvent.press(await screen.findByText('Questions'));
    expect(await screen.findByText('Coming soon')).toBeTruthy();
    // A category with nothing to show yet cannot be opened.
    fireEvent.press(screen.getByText('Fashion'));
    expect(screen.queryByText('Know the Industry')).toBeNull();
  });

  it('shows a full empty state when there are no categories at all', async () => {
    const directory = jest.requireMock('../services/supabase/directory');
    directory.fetchCategories.mockResolvedValueOnce([]);
    const content = jest.requireMock('../services/supabase/questions');
    content.fetchActiveQuestions.mockResolvedValueOnce([]);
    await renderWithProviders(<ChallengesNavigator />);
    fireEvent.press(await screen.findByText('Questions'));
    expect(await screen.findByText('No questions yet')).toBeTruthy();
  });
});
