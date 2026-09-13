import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from '../features/onboarding/OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { PaywallScreen } from '../features/subscription/PaywallScreen';
import { themedHeaderOptions } from './headerOptions';
import { useAppStore } from '../store/useAppStore';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {hasOnboarded ? (
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
