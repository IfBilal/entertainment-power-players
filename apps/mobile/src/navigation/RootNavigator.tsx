import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingNavigator } from '../features/onboarding/OnboardingNavigator';
import { MainTabNavigator } from './MainTabNavigator';
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
    </Stack.Navigator>
  );
}
