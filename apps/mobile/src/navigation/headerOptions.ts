import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors, fontFamilies } from '../theme';

/** Shared native-stack header look — cream chrome, ink title, accent back button. */
export const themedHeaderOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.accent,
  headerTitleStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  headerBackTitle: '',
};
