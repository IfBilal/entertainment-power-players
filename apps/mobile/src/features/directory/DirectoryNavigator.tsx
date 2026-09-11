import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CategoryGridScreen } from './CategoryGridScreen';
import { ContactListScreen } from './ContactListScreen';
import { ContactDetailScreen } from './ContactDetailScreen';
import type { DirectoryStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<DirectoryStackParamList>();

export function DirectoryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CategoryGrid" component={CategoryGridScreen} />
      <Stack.Screen name="ContactList" component={ContactListScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
