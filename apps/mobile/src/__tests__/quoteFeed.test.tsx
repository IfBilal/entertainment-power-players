import { fireEvent, screen } from '@testing-library/react-native';
import { QuoteFeedScreen } from '../features/inspiration/QuoteFeedScreen';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { renderWithProviders } from '../testing/renderWithProviders';

describe('quote feed favorites', () => {
  beforeEach(() => useFavoritesStore.setState({ favoriteQuoteIds: new Set() }));

  it('saves and unsaves quotes from More to Explore and shows them in Saved', async () => {
    await renderWithProviders(<QuoteFeedScreen />);

    const quoteText = 'Opportunities don’t happen. You create them.';
    expect(screen.getByText(quoteText)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Save quote by Chris Grosser'));
    expect(useFavoritesStore.getState().favoriteQuoteIds.has('quote_1')).toBe(true);
    expect(await screen.findByLabelText('Remove saved quote by Chris Grosser')).toBeTruthy();

    fireEvent.press(screen.getAllByText('Saved')[0]);
    expect(screen.getByText(quoteText)).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Remove saved quote by Chris Grosser'));
    expect(useFavoritesStore.getState().favoriteQuoteIds.has('quote_1')).toBe(false);
  });
});
