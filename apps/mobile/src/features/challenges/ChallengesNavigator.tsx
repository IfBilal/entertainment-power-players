import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TrackListScreen } from './TrackListScreen';
import { TrackDetailScreen } from './TrackDetailScreen';
import { ChallengeDetailScreen } from './ChallengeDetailScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { ChallengesStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<ChallengesStackParamList>();

export function ChallengesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="TrackList" component={TrackListScreen} />
      <Stack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
