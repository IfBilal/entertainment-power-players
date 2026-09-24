import { fireEvent, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { updateSelectedTracks } from '../services/supabase/profile';

jest.mock('../services/supabase/profile', () => ({
  updateSelectedTracks: jest.fn(async () => undefined),
}));

describe('profile track selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ isPro: false });
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  });

  it('allows multiple tracks and saves the edited selection', async () => {
    await renderWithProviders(<RootNavigator />);
    fireEvent.press(await screen.findByText('Profile'));
    fireEvent.press(await screen.findByText('Track Selection'));
    fireEvent.press(await screen.findByText('Film + TV'));

    expect(updateSelectedTracks).toHaveBeenCalledWith('test-user', ['fashion', 'film-tv']);
    expect(useAuthStore.getState().selectedTrackSlugs).toEqual(['fashion', 'film-tv']);
  });
});
