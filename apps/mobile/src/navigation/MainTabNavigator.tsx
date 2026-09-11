import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DirectoryNavigator } from '../features/directory/DirectoryNavigator';
import { TrackerNavigator } from '../features/tracker/TrackerNavigator';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { InspirationNavigator } from '../features/inspiration/InspirationNavigator';
import { ProfileNavigator } from '../features/profile/ProfileNavigator';
import { colors, fontFamilies, tabIcons } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          height: 60,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={tabIcons[route.name]} size={focused ? size + 1 : size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Directory" component={DirectoryNavigator} />
      <Tab.Screen name="Tracker" component={TrackerNavigator} />
      <Tab.Screen name="Challenges" component={ChallengesNavigator} />
      <Tab.Screen name="Inspiration" component={InspirationNavigator} />
      <Tab.Screen name="Profile" component={ProfileNavigator} />
    </Tab.Navigator>
  );
}
