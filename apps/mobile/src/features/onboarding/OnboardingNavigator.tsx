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
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: true, title: '' }} />
      <Stack.Screen name="TrackPicker" component={TrackPickerScreen} />
    </Stack.Navigator>
  );
}
