import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { TrackPickerScreen } from './src/features/onboarding/TrackPickerScreen';
import { SplashScreen as SplashScreen2 } from './src/features/onboarding/SplashScreen';
import { HomeScreen } from './src/features/home/HomeScreen';
import { CategoryGridScreen } from './src/features/directory/CategoryGridScreen';
import { TrackerDashboardScreen } from './src/features/tracker/TrackerDashboardScreen';
import { LogActivityScreen } from './src/features/tracker/LogActivityScreen';
import { TrackListScreen } from './src/features/challenges/TrackListScreen';
import { QuoteFeedScreen } from './src/features/inspiration/QuoteFeedScreen';
import { ProfileHomeScreen } from './src/features/profile/ProfileHomeScreen';
import { PaywallScreen } from './src/features/subscription/PaywallScreen';
import { ContactDetailScreen } from './src/features/directory/ContactDetailScreen';
import { ContactListScreen } from './src/features/directory/ContactListScreen';
import { TrackDetailScreen } from './src/features/challenges/TrackDetailScreen';
import { ChallengeDetailScreen } from './src/features/challenges/ChallengeDetailScreen';
import { EditProfileScreen, NotificationsScreen, SubscriptionScreen } from './src/features/profile/ProfileSettingsScreens';
import { useAppStore } from './src/store/useAppStore';
import { useChallengesStore } from './src/store/useChallengesStore';
import { colors, useAppFonts } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

// Built on DarkTheme, not DefaultTheme: the light base leaves white flashes
// between screen transitions and a white card colour behind modals.
const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accentLime,
  },
};

/**
 * Dev-only screen preview. Returns an element for `?preview=<name>` on web in
 * development, otherwise null so the normal navigator renders.
 */
function previewScreen() {
  if (!__DEV__ || Platform.OS !== 'web') return null;
  const name = new URLSearchParams(globalThis.location?.search ?? '').get('preview');
  if (!name) return null;
  useAppStore.setState({ isPro: true });
  useChallengesStore.setState({ progress: { 'creators-producers_3': { status: 'not_started', count: 1 } } });

  const noop = { navigate: () => {}, goBack: () => {}, replace: () => {} };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: any = { navigation: noop, route: { params: {} } };

  // Mock only the isolated dev previews; app data remains Supabase-backed.
  queryClient.setQueryData(['categories'], [
    { slug: 'fashion', name: 'Fashion', icon: 'shirt-outline', order: 1 },
    { slug: 'film-tv', name: 'Film + TV', icon: 'film-outline', order: 2 },
    { slug: 'gaming', name: 'Gaming', icon: 'game-controller-outline', order: 3 },
    { slug: 'music', name: 'Music', icon: 'musical-notes-outline', order: 4 },
    { slug: 'sports', name: 'Sports', icon: 'football-outline', order: 5 },
  ]);
  queryClient.setQueryData(['categoryCounts'], { fashion: 1842, 'film-tv': 2488, gaming: 1208, music: 1547, sports: 1106 });
  const sampleContacts = [
    { id: 'alex', name: 'Alex Rivera', nameLower: 'alex rivera', sortKey: 'alex rivera', categorySlug: 'fashion', role: 'Stylist', company: 'Rikna Studio', email: 'alex@example.com', phone: '+44 20 1234 5678', website: 'https://example.com', city: 'London, UK', notes: 'Met at London Fashion Week. Great connections with emerging designers.' },
    { id: 'amara', name: 'Amara Singh', nameLower: 'amara singh', sortKey: 'amara singh', categorySlug: 'fashion', role: 'Casting Director', company: 'Zenith', city: 'Paris' },
    { id: 'daniel', name: 'Daniel Kim', nameLower: 'daniel kim', sortKey: 'daniel kim', categorySlug: 'fashion', role: 'Model', company: 'KKK Agency', city: 'New York' },
    { id: 'blanca', name: 'Blanca Lopez', nameLower: 'blanca lopez', sortKey: 'blanca lopez', categorySlug: 'fashion', role: 'Producer', company: 'Luna Media', city: 'LA' },
    { id: 'caleb', name: 'Caleb Wright', nameLower: 'caleb wright', sortKey: 'caleb wright', categorySlug: 'fashion', role: 'Buyer', company: 'Voyager Group', city: 'Milan' },
  ];
  queryClient.setQueryData(['contacts', 'fashion'], sampleContacts);
  queryClient.setQueryData(['contact', 'alex'], sampleContacts[0]);

  switch (name) {
    case 'Tabs':
      return <MainTabNavigator />;
    case 'TrackPicker':
      return <TrackPickerScreen {...props} />;
    case 'Splash':
      return <SplashScreen2 {...props} />;
    case 'Home':
      return <HomeScreen {...props} />;
    case 'CategoryGrid':
      return <CategoryGridScreen {...props} />;
    case 'ContactList':
      props.route.params = { categorySlug: 'fashion' };
      return <ContactListScreen {...props} />;
    case 'ContactDetail':
      props.route.params = { contactId: 'alex' };
      return <ContactDetailScreen {...props} />;
    case 'Tracker':
      return <TrackerDashboardScreen {...props} />;
    case 'LogActivity':
      return <LogActivityScreen {...props} />;
    case 'Challenges':
      return <TrackListScreen {...props} />;
    case 'ChallengeDetail':
      props.route.params = { trackSlug: 'creators-producers', challengeOrder: 3 };
      return <ChallengeDetailScreen {...props} />;
    case 'Inspiration':
      return <QuoteFeedScreen {...props} />;
    case 'Profile':
      return <ProfileHomeScreen {...props} />;
    case 'EditProfile':
      return <EditProfileScreen {...props} />;
    case 'Subscription':
      return <SubscriptionScreen {...props} />;
    case 'Notifications':
      return <NotificationsScreen {...props} />;
    case 'Paywall':
      return <PaywallScreen {...props} />;
    default:
      return null;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const ready = fontsLoaded || Boolean(fontError);

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  const onLayoutRootView = useCallback(async () => {
    if (ready) {
      await SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  // Dev-only: `?preview=<ScreenName>` renders one screen in isolation so the
  // revamp can be checked against the mockups without driving real auth to
  // reach deep screens. Web + __DEV__ only, so it cannot ship in a build.
  const preview = previewScreen();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer theme={navigationTheme}>
            {preview ?? <RootNavigator />}
            {/* Light glyphs: the app is dark-only, and "dark" would paint the
                clock and battery near-black against a near-black bar. */}
            <StatusBar style="light" />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}
