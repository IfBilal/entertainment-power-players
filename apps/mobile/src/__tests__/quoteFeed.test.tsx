import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { QuoteFeedScreen } from '../features/inspiration/QuoteFeedScreen';
import { useAuthStore } from '../store/useAuthStore';
import { renderWithProviders } from '../testing/renderWithProviders';
import { fetchQuoteFavoriteIds, setQuoteFavorite } from '../services/supabase/quoteFavorites';
import { mockQuotes } from '../services/mock/quotes';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const mockSavedByUser: Record<string, string[]> = {};
jest.mock('../services/supabase/content', () => ({
  fetchActiveQuotes: jest.fn(async () => [...mockQuotes]),
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

    const quoteText = 'Opportunities don’t happen. You create them.';
    expect(await screen.findByText(quoteText)).toBeTruthy();
    await waitFor(() => expect(fetchQuoteFavoriteIds).toHaveBeenCalledWith('test-user'));
    fireEvent.press(screen.getByLabelText('Save quote by Chris Grosser'));
    await waitFor(() => expect(mockSavedByUser['test-user']).toContain('quote_1'));
    expect(await screen.findByLabelText('Remove saved quote by Chris Grosser')).toBeTruthy();

    fireEvent.press((await screen.findAllByText('Saved'))[0]);
    expect(screen.getByText(quoteText)).toBeTruthy();
    fireEvent.press(await screen.findByLabelText('Remove saved quote by Chris Grosser'));
    await waitFor(() => expect(mockSavedByUser['test-user']).not.toContain('quote_1'));
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
    expect(await screen.findByText('ENTERTAINMENT POWER PLAYERS')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Share quote image'));
    await waitFor(() => expect(captureRef).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ format: 'png', width: 1080, height: 1440 })));
    expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///tmp/quote.png', expect.objectContaining({ mimeType: 'image/png' }));
  });
});
