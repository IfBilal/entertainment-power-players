import { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from '../features/onboarding/OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { PaywallScreen } from '../features/subscription/PaywallScreen';
import { themedHeaderOptions } from './headerOptions';
import { useAuthStore } from '../store/useAuthStore';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const selectedTrackSlugs = useAuthStore((s) => s.selectedTrackSlugs);
  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => hydrate(), [hydrate]);

  // Fully onboarded: signed in AND has picked at least one track. Anything
  // else (loading, signed out, or signed in but track picker not finished
  // yet) shows the Onboarding stack -- Splash decides where within it to
  // land (see SplashScreen).
  const showMain = status === 'signedIn' && (selectedTrackSlugs?.length ?? 0) > 0;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showMain ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}
      {/*
        Paywall lives at the root, not nested inside any tab's stack. It's
        reachable from any screen (Directory, Challenges, Profile) via
        rootNavigation.navigate('Paywall', ...). Dismissing it (goBack) always
        returns to exactly the tab/screen the user was on -- no cross-tab
        indirection, no ambiguous "which stack does goBack pop" behavior.
      */}
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ ...themedHeaderOptions, headerShown: true, title: '', presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
