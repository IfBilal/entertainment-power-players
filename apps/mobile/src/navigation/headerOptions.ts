import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors, fontFamilies } from '../theme';

/** Shared native-stack header look. Kept opaque and matched to the screen
 *  background rather than transparent: a transparent header would need every
 *  screen to reserve the inset itself, and any that forgot would clip its
 *  first line of content under the status bar. */
export const themedHeaderOptions: NativeStackNavigationOptions = {
  headerShadowVisible: false,
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.accentLime,
  headerTitleStyle: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, color: colors.textPrimary },
  headerBackTitle: '',
};
