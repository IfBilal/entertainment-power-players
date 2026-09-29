import { fireEvent, screen, waitFor } from '@testing-library/react-native';
import { QuoteFeedScreen } from '../features/inspiration/QuoteFeedScreen';
import { useAuthStore } from '../store/useAuthStore';
import { renderWithProviders } from '../testing/renderWithProviders';
import { loadSavedQuoteIds, storeSavedQuoteIds } from '../services/local/savedQuotes';

const mockSavedByUser: Record<string, string[]> = {};
jest.mock('../services/local/savedQuotes', () => ({
  loadSavedQuoteIds: jest.fn(async (userId: string) => mockSavedByUser[userId] ?? []),
  storeSavedQuoteIds: jest.fn(async (userId: string, ids: string[]) => { mockSavedByUser[userId] = ids; }),
}));

describe('quote feed favorites', () => {
  beforeEach(() => {
    for (const key of Object.keys(mockSavedByUser)) delete mockSavedByUser[key];
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', hydrated: true });
  });

  it('saves and unsaves quotes from More to Explore and shows them in Saved', async () => {
    await renderWithProviders(<QuoteFeedScreen />);

    const quoteText = 'Opportunities don’t happen. You create them.';
    expect(screen.getByText(quoteText)).toBeTruthy();
    await waitFor(() => expect(loadSavedQuoteIds).toHaveBeenCalledWith('test-user'));
    fireEvent.press(screen.getByLabelText('Save quote by Chris Grosser'));
    await waitFor(() => expect(mockSavedByUser['test-user']).toContain('quote_1'));
    expect(await screen.findByLabelText('Remove saved quote by Chris Grosser')).toBeTruthy();

    fireEvent.press((await screen.findAllByText('Saved'))[0]);
    expect(screen.getByText(quoteText)).toBeTruthy();
    fireEvent.press(await screen.findByLabelText('Remove saved quote by Chris Grosser'));
    await waitFor(() => expect(mockSavedByUser['test-user']).not.toContain('quote_1'));
    expect(storeSavedQuoteIds).toHaveBeenCalled();
  });

  it('does not show another account’s saved quotes', async () => {
    mockSavedByUser['first-user'] = ['quote_1'];
    useAuthStore.setState({ status: 'signedIn', userId: 'second-user', hydrated: true });
    await renderWithProviders(<QuoteFeedScreen />);
    fireEvent.press((await screen.findAllByText('Saved'))[0]);
    await waitFor(() => expect(loadSavedQuoteIds).toHaveBeenCalledWith('second-user'));
    expect(screen.queryByText('Opportunities don’t happen. You create them.')).toBeNull();
  });
});
