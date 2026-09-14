import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAppStore } from '../store/useAppStore';
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

describe('Paywall reached from a locked screen (root-level modal)', () => {
  beforeEach(() => {
    useAppStore.setState({ isPro: false });
    // Signed in with tracks already picked == fully onboarded, so
    // RootNavigator renders the Main tabs directly (no Splash/auth wait).
    // `hydrated: true` stops RootNavigator's hydrate() from kicking off a
    // real Supabase session lookup during the test.
    useAuthStore.setState({
      status: 'signedIn',
      userId: 'test-user',
      selectedTrackSlugs: ['fashion'],
      hydrated: true,
    });
  });

  it('returns to the exact locked screen it was opened from after subscribing, not to a different tab', async () => {
    await renderApp();

    // Directory tab is the initial tab, showing the category grid.
    fireEvent.press(await screen.findByText('Fashion'));

    // Free user hits the paywall gate on the contact list.
    expect(await screen.findByText('Pro feature')).toBeTruthy();
    fireEvent.press(screen.getByText('See plans'));

    // Root-level paywall modal appears.
    expect(await screen.findByText('Open every door')).toBeTruthy();
    fireEvent.press(screen.getByText('Subscribe'));

    // Back on the Fashion contact list -- now unlocked, not bounced to another tab/screen.
    expect(await screen.findByPlaceholderText('Search by name, company or role')).toBeTruthy();
    expect(screen.queryByText('Pro feature')).toBeNull();
  });

  it('returns to Profile (not Directory) when opened from Profile > Upgrade to Pro', async () => {
    await renderApp();

    // Switch to the Profile tab.
    fireEvent.press(await screen.findByText('Profile'));
    expect(await screen.findByText('Upgrade to Pro')).toBeTruthy();
    fireEvent.press(screen.getByText('Upgrade to Pro'));

    expect(await screen.findByText('Open every door')).toBeTruthy();
    fireEvent.press(screen.getByText('Subscribe'));

    // Should land back on Profile, showing the now-Pro state -- not on Directory.
    expect(await screen.findByText('Renews monthly')).toBeTruthy();
    expect(screen.queryByText('Who you should know')).toBeNull();
  });
});
