import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { render, screen } from '@testing-library/react-native';
import { OnboardingNavigator } from '../features/onboarding/OnboardingNavigator';

const testMetrics: Metrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

describe('OnboardingNavigator', () => {
  it('starts on the splash screen without crashing', async () => {
    // SplashScreen auto-navigates to IntroSlides after 900ms on a real timer;
    // assert synchronously right after the initial render so the test isn't
    // racing that timeout.
    await render(
      <SafeAreaProvider initialMetrics={testMetrics}>
        <NavigationContainer>
          <OnboardingNavigator />
        </NavigationContainer>
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Power Players')).toBeTruthy();
  });
});
