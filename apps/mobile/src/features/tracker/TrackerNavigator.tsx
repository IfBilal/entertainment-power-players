import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TrackerDashboardScreen } from './TrackerDashboardScreen';
import { LogEntryScreen } from './LogEntryScreen';
import { GoalsEditorScreen } from './GoalsEditorScreen';
import { TrackerHistoryScreen } from './TrackerHistoryScreen';
import type { TrackerStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<TrackerStackParamList>();

export function TrackerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrackerDashboard" component={TrackerDashboardScreen} />
      <Stack.Screen name="LogEntry" component={LogEntryScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="GoalsEditor" component={GoalsEditorScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="TrackerHistory" component={TrackerHistoryScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
