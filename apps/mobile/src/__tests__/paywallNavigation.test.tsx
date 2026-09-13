import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAppStore } from '../store/useAppStore';

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
    useAppStore.setState({ hasOnboarded: true, isPro: false, selectedTrackSlugs: [] });
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
});
