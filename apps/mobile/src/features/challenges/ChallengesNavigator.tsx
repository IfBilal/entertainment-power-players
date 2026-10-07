import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TrackListScreen } from './TrackListScreen';
import { TrackDetailScreen } from './TrackDetailScreen';
import { ChallengeDetailScreen } from './ChallengeDetailScreen';
import { QuestionCategoriesScreen } from './QuestionCategoriesScreen';
import { QuestionGroupsScreen } from './QuestionGroupsScreen';
import { QuestionListScreen } from './QuestionListScreen';
import { QuestionDetailScreen } from './QuestionDetailScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { ChallengesStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<ChallengesStackParamList>();

export function ChallengesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="TrackList" component={TrackListScreen} />
      <Stack.Screen name="TrackDetail" component={TrackDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionCategories" component={QuestionCategoriesScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionGroups" component={QuestionGroupsScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
