import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';

/**
 * Inter throughout. The client mockups use a single clean grotesk for both
 * headlines and body — the previous editorial serif (Fraunces) belonged to the
 * old warm/paper theme and reads wrong against the new dark, neon-accented UI.
 *
 * The `display*` aliases exist so headline call sites stay semantic; they point
 * at Inter's heavier cuts rather than a second family.
 */
export const fontFamilies = {
  displayMedium: 'Inter_500Medium',
  displaySemiBold: 'Inter_600SemiBold',
  displayBold: 'Inter_700Bold',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export function useAppFonts() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
