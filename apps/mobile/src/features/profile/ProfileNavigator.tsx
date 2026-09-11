import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileHomeScreen } from './ProfileHomeScreen';
import { PaywallScreen } from '../subscription/PaywallScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { ProfileStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{ headerShown: true, title: '', presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}
