import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { QuoteFeedScreen } from '../features/inspiration/QuoteFeedScreen';
import { useAuthStore } from '../store/useAuthStore';
import { renderWithProviders } from '../testing/renderWithProviders';
import { fetchQuoteFavoriteIds, setQuoteFavorite } from '../services/supabase/quoteFavorites';
import type { QuoteRecord } from '../types/week3';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const mockQuotes: QuoteRecord[] = [
  { id: 'quote_featured', text: 'The best projects happen when you surround yourself with curious people.', author: 'Industry Voice', active: true, order: 0 },
  { id: 'quote_1', text: 'Opportunities don’t happen. You create them.', author: 'Chris Grosser', active: true, order: 1 },
  { id: 'quote_2', text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', active: true, order: 2 },
];
// The server, not a client hash, now decides which quote is featured. Fixing
// it here keeps these tests about favorites/sharing, not about allocation,
// which the SQL-level rotation tests own.
const mockFeaturedQuote = mockQuotes[0];

const mockSavedByUser: Record<string, string[]> = {};
jest.mock('../services/supabase/content', () => ({
  fetchActiveQuotes: jest.fn(async () => [...mockQuotes]),
  fetchDailyQuote: jest.fn(async () => ({ quoteId: mockFeaturedQuote.id, text: mockFeaturedQuote.text, author: mockFeaturedQuote.author, localDate: '2026-10-07' })),
  syncProfileTimezone: jest.fn(async () => undefined),
  getDeviceTimeZone: jest.fn(() => 'UTC'),
}));
jest.mock('../services/supabase/quoteFavorites', () => ({
  quoteFavoritesQueryKey: (userId: string | null) => ['quoteFavorites', userId],
  migrateLocalQuoteFavorites: jest.fn(async () => undefined),
  fetchQuoteFavoriteIds: jest.fn(async (userId: string) => mockSavedByUser[userId] ?? []),
  setQuoteFavorite: jest.fn(async (userId: string, id: string, saved: boolean) => {
    const previous = mockSavedByUser[userId] ?? [];
    mockSavedByUser[userId] = saved ? [...previous, id] : previous.filter((item) => item !== id);
  }),
}));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(async () => true), shareAsync: jest.fn(async () => undefined) }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(async () => 'file:///tmp/quote.png') }));

describe('quote feed favorites', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockSavedByUser)) delete mockSavedByUser[key];
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });
  });

  it('saves and unsaves quotes from More to Explore and shows them in Saved', async () => {
    await renderWithProviders(<QuoteFeedScreen />);

    const target = mockQuotes.find((quote) => quote.id !== mockFeaturedQuote.id)!;
    expect(await screen.findByText(target.text)).toBeTruthy();
    await waitFor(() => expect(fetchQuoteFavoriteIds).toHaveBeenCalledWith('test-user'));
    fireEvent.press(screen.getByLabelText(`Save quote by ${target.author}`));
    await waitFor(() => expect(mockSavedByUser['test-user']).toContain(target.id));
    expect(await screen.findByLabelText(`Remove saved quote by ${target.author}`)).toBeTruthy();

    fireEvent.press((await screen.findAllByText('Saved'))[0]);
    expect(screen.getByText(target.text)).toBeTruthy();
    fireEvent.press(await screen.findByLabelText(`Remove saved quote by ${target.author}`));
    await waitFor(() => expect(mockSavedByUser['test-user']).not.toContain(target.id));
    expect(setQuoteFavorite).toHaveBeenCalled();
  });

  it('does not show another account’s saved quotes', async () => {
    mockSavedByUser['first-user'] = ['quote_1'];
    useAuthStore.setState({ status: 'signedIn', userId: 'second-user', hydrated: true });
    await renderWithProviders(<QuoteFeedScreen />);
    fireEvent.press((await screen.findAllByText('Saved'))[0]);
    await waitFor(() => expect(fetchQuoteFavoriteIds).toHaveBeenCalledWith('second-user'));
    expect(screen.queryByText('Opportunities don’t happen. You create them.')).toBeNull();
  });

  it('renders a branded image and shares the PNG rather than text', async () => {
    await renderWithProviders(<QuoteFeedScreen />);
    const actions = await screen.findAllByLabelText('Share quote');
    fireEvent.press(actions[0]);
    expect(await screen.findByText('ENTERTAINMENT POWER PLAYERS®')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Share quote image'));
    await waitFor(() => expect(captureRef).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ format: 'png', width: 1080, height: 1440 })));
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///tmp/quote.png', expect.objectContaining({ mimeType: 'image/png' }));
  });

  it('shows the server-assigned daily quote as the hero, not a locally computed one', async () => {
    await renderWithProviders(<QuoteFeedScreen />);
    expect(await screen.findByText(mockFeaturedQuote.text)).toBeTruthy();
    // The hero never appears a second time in the Explore list below it.
    expect(screen.getAllByText(mockFeaturedQuote.text)).toHaveLength(1);
  });

  it('offers a retry when the daily quote fails to load, and recovers', async () => {
    const content = jest.requireMock('../services/supabase/content');
    content.fetchDailyQuote.mockRejectedValueOnce(new Error('network down'));
    await renderWithProviders(<QuoteFeedScreen />);
    const retry = await screen.findByText("Couldn't load today's quote. Tap to retry.");
    fireEvent.press(retry);
    expect(await screen.findByText(mockFeaturedQuote.text)).toBeTruthy();
  });
});
