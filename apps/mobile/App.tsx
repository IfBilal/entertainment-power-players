import { useCallback, useEffect } from 'react';
import { Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { TrackPickerScreen } from './src/features/onboarding/TrackPickerScreen';
import { SplashScreen as SplashScreen2 } from './src/features/onboarding/SplashScreen';
import { HomeScreen } from './src/features/home/HomeScreen';
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

  const noop = { navigate: () => {}, goBack: () => {}, replace: () => {} };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: any = { navigation: noop, route: { params: {} } };

  switch (name) {
    case 'TrackPicker':
      return <TrackPickerScreen {...props} />;
    case 'Splash':
      return <SplashScreen2 {...props} />;
    case 'Home':
      return <HomeScreen {...props} />;
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
