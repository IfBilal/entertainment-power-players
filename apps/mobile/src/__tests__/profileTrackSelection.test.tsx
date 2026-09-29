import { fireEvent, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { displayNameFromMetadata, useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { updateSelectedTracks } from '../services/supabase/profile';

jest.mock('../services/supabase/content', () => {
  const { testTracks, testChallenges } = jest.requireActual('../testing/mockContent');
  return {
    fetchActiveTracks: jest.fn(async () => testTracks),
    fetchActiveChallenges: jest.fn(async () => testChallenges),
    fetchActiveQuotes: jest.fn(async () => []),
  };
});

jest.mock('../services/supabase/profile', () => ({
  updateSelectedTracks: jest.fn(async () => undefined),
}));

describe('profile track selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAppStore.setState({ isPro: false });
    useAuthStore.setState({ status: 'signedIn', userId: 'test-user', selectedTrackSlugs: ['fashion'], hydrated: true });
  });

  it('shows the signed-in user name in the profile header', async () => {
    useAuthStore.setState({ displayName: 'Aisha Khan' });

    await renderWithProviders(<RootNavigator />);
    fireEvent.press(await screen.findByText('Profile'));

    expect(await screen.findByText('Aisha Khan')).toBeTruthy();
    expect(screen.queryByText('Bilal Tahir')).toBeNull();
  });

  it('gets the name from Supabase auth metadata when available', () => {
    expect(displayNameFromMetadata({ full_name: 'Aisha Khan' })).toBe('Aisha Khan');
    expect(displayNameFromMetadata({ given_name: 'Aisha', family_name: 'Khan' })).toBe('Aisha Khan');
    expect(displayNameFromMetadata({})).toBeNull();
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
