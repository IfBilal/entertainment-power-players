import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAuthStore } from '../store/useAuthStore';

const testMetrics: Metrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

function renderApp() {
  return render(
    <SafeAreaProvider initialMetrics={testMetrics}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>,
  );
}

/**
 * RootNavigator decides Onboarding vs Main purely from auth state:
 * signed in AND at least one track picked == fully onboarded. These pin that
 * rule, since getting it wrong either locks a real user out of the app or
 * lets an unauthenticated one into it.
 */
describe('RootNavigator auth routing', () => {
  // `hydrated: true` prevents hydrate() from starting a real Supabase session
  // lookup during the test.
  it('shows Onboarding (Splash) while auth state is still loading', async () => {
    useAuthStore.setState({ status: 'loading', userId: null, selectedTrackSlugs: null, hydrated: true });
    await renderApp();
    expect(screen.getByText('Power Players')).toBeTruthy();
  });

  it('shows Onboarding when signed out', async () => {
    useAuthStore.setState({ status: 'signedOut', userId: null, selectedTrackSlugs: null, hydrated: true });
    await renderApp();
    expect(screen.getByText('Power Players')).toBeTruthy();
  });

  it('keeps a signed-in user with no tracks picked in Onboarding, not Main', async () => {
    useAuthStore.setState({ status: 'signedIn', userId: 'u1', selectedTrackSlugs: [], hydrated: true });
    await renderApp();
    expect(screen.getByText('Power Players')).toBeTruthy();
    expect(screen.queryByText('Who you should know')).toBeNull();
  });

  it('shows Main once signed in with at least one track picked', async () => {
    useAuthStore.setState({ status: 'signedIn', userId: 'u1', selectedTrackSlugs: ['fashion'], hydrated: true });
    await renderApp();
    expect(await screen.findByText('Who you should know')).toBeTruthy();
  });
});
