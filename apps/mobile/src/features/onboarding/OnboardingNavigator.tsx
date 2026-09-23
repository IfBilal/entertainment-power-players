import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from './SplashScreen';
import { IntroSlidesScreen } from './IntroSlidesScreen';
import { SignUpScreen } from './SignUpScreen';
import { LoginScreen } from './LoginScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { TrackPickerScreen } from './TrackPickerScreen';
import { themedHeaderOptions } from '../../navigation/headerOptions';
import type { OnboardingStackParamList } from '../../navigation/types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, ...themedHeaderOptions }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="IntroSlides" component={IntroSlidesScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      {/* Login owns its whole canvas in the mockup -- logo centred at the top,
          no chrome above it -- so it renders its own layout with no header. */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="TrackPicker" component={TrackPickerScreen} />
    </Stack.Navigator>
  );
}
