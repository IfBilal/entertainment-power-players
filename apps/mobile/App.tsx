import { useCallback, useEffect, useRef } from 'react';
import { AppState, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';
import { TrackPickerScreen } from './src/features/onboarding/TrackPickerScreen';
import { SplashScreen as SplashScreen2 } from './src/features/onboarding/SplashScreen';
import { IntroSlidesScreen } from './src/features/onboarding/IntroSlidesScreen';
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
import { LoginScreen } from './src/features/onboarding/LoginScreen';
import { SignUpScreen } from './src/features/onboarding/SignUpScreen';
import { ForgotPasswordScreen } from './src/features/onboarding/ForgotPasswordScreen';
import { ResetPasswordScreen } from './src/features/onboarding/ResetPasswordScreen';
import { LogEntryScreen } from './src/features/tracker/LogEntryScreen';
import { GoalsEditorScreen } from './src/features/tracker/GoalsEditorScreen';
import { TrackerHistoryScreen } from './src/features/tracker/TrackerHistoryScreen';
import { useAppStore } from './src/store/useAppStore';
import { useAuthStore } from './src/store/useAuthStore';
import { colors, useAppFonts } from './src/theme';
import { AuthDeepLinkHandler } from './src/features/onboarding/AuthDeepLinkHandler';
import { flushPendingAuthNavigation, rootNavigationRef } from './src/navigation/rootNavigation';
import { fetchPremiumAccess } from './src/services/supabase/billing';
import { activityQueryKey } from './src/services/supabase/activity';
import { goalsQueryKey } from './src/services/supabase/goals';
import { challengeProgressQueryKey } from './src/services/supabase/challenges';
import { week3QueryKeys } from './src/types/week3';
import { computeWeekKey } from './src/utils/weekKey';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient();

function AuthCacheGuard() {
  const userId = useAuthStore((state) => state.userId);
  const previousUserId = useRef(userId);
  useEffect(() => {
    if (previousUserId.current !== userId) queryClient.clear();
    previousUserId.current = userId;
  }, [userId]);
  return null;
}

function PremiumForegroundSync() {
  const userId = useAuthStore((state) => state.userId);
  useEffect(() => {
    if (!userId) return;
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      void fetchPremiumAccess().then((hasAccess) => {
        if (useAuthStore.getState().userId !== userId) return;
        const previous = useAppStore.getState().isPro;
        useAppStore.getState().setIsPro(hasAccess);
        if (previous && !hasAccess) queryClient.clear();
      }).catch(() => {
        if (useAuthStore.getState().userId !== userId) return;
        useAppStore.getState().setIsPro(false);
        queryClient.clear();
      });
    });
    return () => listener.remove();
  }, [userId]);
  return null;
}

// Match the native splash and every transition to the supervisor's white UI.
const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    primary: colors.accent,
  },
};

/**
 * Dev-only screen preview. Returns an element for `?preview=<name>` on web in
 * development, otherwise null so the normal navigator renders.
 */
function previewScreen() {
  if (!__DEV__ || Platform.OS !== 'web') return null;
  const previewParams = new URLSearchParams(globalThis.location?.search ?? '');
  const name = previewParams.get('preview');
  if (!name) return null;
  const previewState = previewParams.get('state');
  useAppStore.setState({ isPro: previewState !== 'locked' });
  useAuthStore.setState({ status: 'signedIn', userId: 'preview-user', selectedTrackSlugs: ['fashion', 'sports'], hydrated: true });

  const noop = { navigate: () => {}, goBack: () => {}, replace: () => {} };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: any = { navigation: noop, route: { params: {} } };

  // Mock only the isolated dev previews; app data remains Supabase-backed.
  queryClient.setDefaultOptions({ queries: { staleTime: Infinity, retry: false } });
  queryClient.setQueryData(['categories'], [
    { slug: 'fashion', name: 'Fashion', icon: 'shirt-outline', order: 1 },
    { slug: 'film-tv', name: 'Film/TV', icon: 'film-outline', order: 2 },
    { slug: 'gaming', name: 'Gaming', icon: 'game-controller-outline', order: 3 },
    { slug: 'music', name: 'Music', icon: 'musical-notes-outline', order: 4 },
    { slug: 'sports', name: 'Sports', icon: 'basketball-outline', order: 5 },
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
  queryClient.setQueryData(['contact', 'alex'], previewParams.get('dataset') === 'long'
    ? { ...sampleContacts[0], name: 'Alexandra-Élodie Rivera-Montgomery', role: 'International Fashion Casting Director', company: 'Rikna Studio and Global Creative Partners', notes: 'Met at London Fashion Week. '.repeat(16) }
    : sampleContacts[0]);
  queryClient.setQueryData(week3QueryKeys.tracks, [
    { slug: 'fashion', name: 'Fashion', order: 1, active: true },
    { slug: 'film-tv', name: 'Film/TV', order: 2, active: true },
    { slug: 'gaming', name: 'Gaming', order: 3, active: true },
    { slug: 'music', name: 'Music', order: 4, active: true },
    { slug: 'sports', name: 'Sports', order: 5, active: true },
  ]);
  queryClient.setQueryData(['challenges', 'active'], [
    { id: 'preview-challenge-1', trackSlug: 'fashion', order: 1, title: 'Make a new connection', description: 'Connect with someone in your industry.', type: 'single', target: null, active: true },
    { id: 'preview-challenge-2', trackSlug: 'sports', order: 1, title: 'Attend an industry event', description: 'Meet other professionals.', type: 'single', target: null, active: true },
  ]);
  queryClient.setQueryData(week3QueryKeys.quotes, [
    { id: 'preview-quote-1', text: 'Great work grows from real connections.', author: 'EPP Preview', active: true, order: 1 },
    { id: 'preview-quote-2', text: 'Build momentum one conversation at a time.', author: 'EPP Preview', active: true, order: 2 },
    { id: 'preview-quote-3', text: 'The next opportunity begins with showing up.', author: 'EPP Preview', active: true, order: 3 },
  ]);
  queryClient.setQueryData(challengeProgressQueryKey('preview-user'), {});
  const previewWeek = computeWeekKey(new Date());
  queryClient.setQueryData(goalsQueryKey('preview-user'), { [previewWeek]: { contacts: 5, events: 2, followUps: 3 } });
  queryClient.setQueryData(activityQueryKey('preview-user'), [
    { id: 'preview-activity-1', userId: 'preview-user', type: 'contact', title: 'Alex Rivera', contactId: 'alex', challengeId: null, date: new Date().toISOString(), weekKey: previewWeek, notes: null },
  ]);
  if (previewState === 'empty') {
    queryClient.setQueryData(['categories'], []);
    queryClient.setQueryData(['contacts', 'fashion'], []);
    queryClient.setQueryData(['contact', 'alex'], null);
    queryClient.setQueryData(week3QueryKeys.tracks, []);
    queryClient.setQueryData(['challenges', 'active'], []);
    queryClient.setQueryData(activityQueryKey('preview-user'), []);
  }

  switch (name) {
    case 'Tabs':
      return <MainTabNavigator />;
    case 'TrackPicker':
      return <TrackPickerScreen {...props} />;
    case 'Splash':
      return <SplashScreen2 {...props} />;
    case 'IntroSlides':
      return <IntroSlidesScreen {...props} />;
    case 'Login':
      return <LoginScreen {...props} />;
    case 'SignUp':
      return <SignUpScreen {...props} />;
    case 'ForgotPassword':
      return <ForgotPasswordScreen {...props} />;
    case 'ResetPassword':
      return <ResetPasswordScreen {...props} />;
    case 'Home':
      return <HomeScreen {...props} />;
    case 'CategoryGrid':
      return <CategoryGridScreen {...props} />;
    case 'ContactList':
      props.route.params = { categorySlug: 'fashion' };
      if (new URLSearchParams(globalThis.location.search).get('dataset') === 'long') {
        queryClient.setQueryData(['contacts', 'fashion'], [
          ...sampleContacts,
          ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').flatMap((letter) =>
            Array.from({ length: 5 }, (_, index) => ({
              id: `preview-${letter}-${index}`,
              name: `${letter} Preview Contact ${index + 1}`,
              nameLower: `${letter.toLowerCase()} preview contact ${index + 1}`,
              sortKey: `${letter.toLowerCase()} preview contact ${index + 1}`,
              categorySlug: 'fashion',
              role: 'Stylist',
              city: 'London, UK',
            }))),
        ]);
      }
      return <ContactListScreen {...props} />;
    case 'ContactDetail':
      props.route.params = { contactId: 'alex' };
      return <ContactDetailScreen {...props} />;
    case 'Tracker':
      return <TrackerDashboardScreen {...props} />;
    case 'LogActivity':
      return <LogActivityScreen {...props} />;
    case 'LogEntry':
      props.route.params = { type: previewParams.get('type') === 'event' ? 'event' : previewParams.get('type') === 'followUp' ? 'followUp' : 'contact' };
      return <LogEntryScreen {...props} />;
    case 'GoalsEditor':
      return <GoalsEditorScreen {...props} />;
    case 'TrackerHistory':
      return <TrackerHistoryScreen {...props} />;
    case 'Challenges':
      return <TrackListScreen {...props} />;
    case 'TrackDetail':
      props.route.params = { trackSlug: 'fashion' };
      return <TrackDetailScreen {...props} />;
    case 'ChallengeDetail':
      props.route.params = { trackSlug: 'fashion', challengeId: 'preview-challenge-1' };
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
          {preview ? null : <AuthCacheGuard />}
          {preview ? null : <PremiumForegroundSync />}
          <NavigationContainer
            ref={rootNavigationRef}
            onReady={flushPendingAuthNavigation}
            theme={navigationTheme}
          >
            <AuthDeepLinkHandler />
            {preview ?? <RootNavigator />}
            <StatusBar style="dark" />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </View>
  );
}
