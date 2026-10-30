import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QuestionCategoriesScreen } from './QuestionCategoriesScreen';
import { QuestionGroupsScreen } from './QuestionGroupsScreen';
import { QuestionListScreen } from './QuestionListScreen';
import { QuestionDetailScreen } from './QuestionDetailScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { PowerMovesStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<PowerMovesStackParamList>();

export function PowerMovesNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="QuestionCategories" component={QuestionCategoriesScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionGroups" component={QuestionGroupsScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionList" component={QuestionListScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="QuestionDetail" component={QuestionDetailScreen} options={{ headerShown: true, title: '' }} />
    </Stack.Navigator>
  );
}
