import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HomeNavigator } from '../features/home/HomeNavigator';
import { PowerMovesNavigator } from '../features/questions/PowerMovesNavigator';
import { ChallengesNavigator } from '../features/challenges/ChallengesNavigator';
import { SearchNavigator } from '../features/directory/SearchNavigator';
import { colors, fontFamilies, radius, tabIcons } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

/** A restrained selected pill keeps all four icons legible on the white bar. */
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
        <MaterialCommunityIcons name={tabIcons[route]} size={size + 1} color={color} />
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
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
        tabBarBackground: () => <TabBarBackground />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          width: '100%',
          height: 68 + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(8, insets.bottom),
          elevation: 0,
        },
        tabBarItemStyle: { flex: 1, width: '20%', minWidth: 0, paddingTop: 2, paddingBottom: 1 },
        tabBarLabelStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11, marginTop: 2 },
        tabBarIcon: ({ color, size, focused }) => (
          <TabIcon route={route.name} color={color} size={size} focused={focused} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeNavigator} />
      <Tab.Screen name="PowerMoves" component={PowerMovesNavigator} />
      <Tab.Screen name="Challenges" component={ChallengesNavigator} />
      <Tab.Screen name="Search" component={SearchNavigator} />
    </Tab.Navigator>
  );
}

function TabBarBackground() {
  return <View style={styles.barBackground} pointerEvents="none" />;
}

const styles = StyleSheet.create({
  barBackground: { ...StyleSheet.absoluteFill, backgroundColor: colors.background },
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
    borderWidth: 1,
    borderColor: colors.border,
  },
});
