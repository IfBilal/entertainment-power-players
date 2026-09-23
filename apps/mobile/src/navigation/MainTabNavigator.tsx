import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DirectoryNavigator } from '../features/directory/DirectoryNavigator';
import { TrackerNavigator } from '../features/tracker/TrackerNavigator';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { InspirationNavigator } from '../features/inspiration/InspirationNavigator';
import { ProfileNavigator } from '../features/profile/ProfileNavigator';
import { colors, fontFamilies, glows, radius, tabIcons } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * The active tab in the mockups sits in a glowing tinted pill rather than just
 * changing colour — that bloom is the only thing distinguishing it at a glance
 * on a near-black bar.
 */
function TabIcon({ route, color, size, focused }: { route: string; color: string; size: number; focused: boolean }) {
  return (
    <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
      <Ionicons name={tabIcons[route]} size={focused ? size + 1 : size} color={color} />
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentLime,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.backgroundDeep,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 66,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11 },
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon route={route.name} color={color} size={size} focused={focused} />
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

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  iconWrapActive: {
    backgroundColor: colors.accentSoft,
    ...glows.lime,
    elevation: 6,
  },
});
