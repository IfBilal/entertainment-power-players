import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { MainTabNavigator } from '../navigation/MainTabNavigator';

// `initialWindowMetrics` is null under the Jest test renderer (no real native
// measurement pass ever fires), which leaves SafeAreaProvider's children
// unrendered. Supplying explicit metrics unblocks it in tests.
const testMetrics: Metrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

describe('MainTabNavigator', () => {
  it('renders all five tabs and each is reachable', async () => {
    await render(
      <SafeAreaProvider initialMetrics={testMetrics}>
        <NavigationContainer>
          <MainTabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>,
    );

    // Directory is the initial tab — its screen content (a category name) confirms it rendered.
    expect(await screen.findByText('Fashion')).toBeTruthy();

    for (const tab of ['Tracker', 'Challenges', 'Inspiration', 'Profile']) {
      fireEvent.press(screen.getByText(tab));
    }

    // Profile tab renders its "Subscription" card once selected.
    expect(await screen.findByText('Subscription')).toBeTruthy();
  });
});
