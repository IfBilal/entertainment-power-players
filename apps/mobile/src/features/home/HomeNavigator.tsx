import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from './HomeScreen';
import { TrackerDashboardScreen } from '../tracker/TrackerDashboardScreen';
import { LogActivityScreen } from '../tracker/LogActivityScreen';
import { LogEntryScreen } from '../tracker/LogEntryScreen';
import { GoalsEditorScreen } from '../tracker/GoalsEditorScreen';
import { TrackerHistoryScreen } from '../tracker/TrackerHistoryScreen';
import { QuoteFeedScreen } from '../inspiration/QuoteFeedScreen';
import { ProfileHomeScreen } from '../profile/ProfileHomeScreen';
import { EditProfileScreen, NotificationsScreen, SubscriptionScreen } from '../profile/ProfileSettingsScreens';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { HomeStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TrackerDashboard" component={TrackerDashboardScreen} />
      <Stack.Screen name="LogActivity" component={LogActivityScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="GoalsEditor" component={GoalsEditorScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="TrackerHistory" component={TrackerHistoryScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuoteFeed" component={QuoteFeedScreen} />
      <Stack.Screen name="ProfileHome" component={ProfileHomeScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
    </Stack.Navigator>
  );
}
