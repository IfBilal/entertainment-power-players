import { act, screen, waitFor } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { renderWithProviders } from '../testing/renderWithProviders';
import { useAuthStore } from '../store/useAuthStore';

jest.mock('../services/supabase/directory', () => ({
  fetchCategories: jest.fn(async () => []),
  fetchCategoryCounts: jest.fn(async () => ({})),
  fetchContactsByCategory: jest.fn(async () => []),
  fetchContactById: jest.fn(async () => null),
  fetchFavoriteContactIds: jest.fn(async () => []),
  addFavorite: jest.fn(async () => undefined),
  removeFavorite: jest.fn(async () => undefined),
  logContactedActivity: jest.fn(async () => undefined),
}));

/**
 * Regression test for a real bug caught during live device testing: the
 * splash screen's minimum-display timer captured a stale closure over
 * status/selectedTrackSlugs from mount. If auth resolved *before* that
 * timer fired -- exactly what happens on a fast connection -- the app got
 * stuck on the splash screen permanently, because the timer's callback saw
 * frozen mount-time values that never matched any branch, and nothing else
 * ever re-triggered navigation afterward. This test resolves auth almost
 * immediately (well under the timer's delay) and asserts navigation still
 * happens once the minimum display time passes -- this reproduces the bug
 * on the pre-fix SplashScreen (the assertion below times out) and passes
 * on the fixed one (ref-based state, no stale closure).
 */
describe('SplashScreen: auth resolving faster than the minimum display time', () => {
  it('still navigates once the minimum display time elapses, not stuck forever', async () => {
    useAuthStore.setState({ status: 'loading', userId: null, selectedTrackSlugs: null, hydrated: true });
    await renderWithProviders(<RootNavigator />);
    expect(screen.getByLabelText('Entertainment Power Players')).toBeTruthy();

    // Auth resolves almost immediately -- far faster than the splash
    // screen's ~1.1s minimum display timer.
    act(() => {
      useAuthStore.setState({ status: 'signedOut', userId: null, selectedTrackSlugs: null });
    });

    // Once the minimum display time has actually elapsed, navigation must
    // still happen -- this is the assertion that fails (times out) against
    // the pre-fix stale-closure version.
    //
    // Anchors on the slide's advance button rather than headline copy or
    // secondary chrome: both of those move with the design (the revamp
    // rewrote the headline, then dropped the Skip link), whereas the slide
    // cannot function without a way forward. This test is about navigation.
    await waitFor(() => expect(screen.getByText('Next')).toBeTruthy(), { timeout: 3000 });
  });
});
