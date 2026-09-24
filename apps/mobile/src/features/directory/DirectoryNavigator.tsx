import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../home/HomeScreen';
import { CategoryGridScreen } from './CategoryGridScreen';
import { ContactListScreen } from './ContactListScreen';
import { ContactDetailScreen } from './ContactDetailScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { DirectoryStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<DirectoryStackParamList>();

export function DirectoryNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CategoryGrid" component={CategoryGridScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ContactList" component={ContactListScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ContactDetail" component={ContactDetailScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
