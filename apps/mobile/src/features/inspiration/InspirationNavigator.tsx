import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QuoteFeedScreen } from './QuoteFeedScreen';
import type { InspirationStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<InspirationStackParamList>();

export function InspirationNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="QuoteFeed" component={QuoteFeedScreen} />
    </Stack.Navigator>
  );
}
