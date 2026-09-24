import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const focus = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;

    const animation = Animated.spring(focus, {
      toValue: focused ? 1 : 0,
      speed: 22,
      bounciness: 7,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [focus, focused]);

  const highlightScale = focus.interpolate({ inputRange: [0, 1], outputRange: [0.72, 1] });
  const iconScale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });

  return (
    <View style={styles.iconWrap} testID={`main-tab-icon-${route}`}>
      <Animated.View
        pointerEvents="none"
        style={[styles.iconHighlight, { opacity: focus, transform: [{ scale: highlightScale }] }]}
      />
      <Animated.View style={{ transform: [{ scale: iconScale }] }}>
        <Ionicons name={tabIcons[route]} size={size + 1} color={color} />
      </Animated.View>
    </View>
  );
}

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accentLime,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          width: '100%',
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(8, insets.bottom),
          elevation: 0,
        },
        tabBarItemStyle: { flex: 1, width: '20%', minWidth: 0, paddingTop: 2, paddingBottom: 1 },
        tabBarLabelStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 10, marginTop: 2 },
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

function TabBarBackground() {
  return (
    <View style={styles.barBackground} pointerEvents="none">
      <View style={styles.barSurface} />
      <LinearGradient
        colors={[colors.accentLime, colors.accentAmber, colors.accentOrange]}
        locations={[0, 0.52, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.barAccent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  barBackground: { ...StyleSheet.absoluteFill },
  barSurface: { ...StyleSheet.absoluteFill, backgroundColor: colors.backgroundDeep, opacity: 0.97 },
  barAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 1.5, opacity: 0.72 },
  iconWrap: {
    width: 46,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconHighlight: {
    position: 'absolute',
    width: 42,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    ...glows.lime,
    elevation: 5,
  },
});
