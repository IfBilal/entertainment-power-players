import {
  useFonts,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_600SemiBold_Italic,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';

/**
 * Fraunces (a warm, high-contrast editorial serif) for headlines/display;
 * Inter (a clean, highly legible grotesk) for body/UI text. Deliberately not
 * the system font — a premium feel needs a real typeface, per user direction.
 */
export const fontFamilies = {
  serifMedium: 'Fraunces_500Medium',
  serifSemiBold: 'Fraunces_600SemiBold',
  serifSemiBoldItalic: 'Fraunces_600SemiBold_Italic',
  serifBold: 'Fraunces_700Bold',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export function useAppFonts() {
  return useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_600SemiBold_Italic,
    Fraunces_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
}
