import { fontFamilies } from './fonts';

/** Inter throughout; confident hierarchy and larger action text for the light UI. */
export const typography = {
  hero: { fontFamily: fontFamilies.displayBold, fontSize: 38, lineHeight: 44, letterSpacing: -1.1 },
  display: { fontFamily: fontFamilies.displayBold, fontSize: 32, lineHeight: 38, letterSpacing: -0.8 },
  title: { fontFamily: fontFamilies.displaySemiBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  titleItalic: { fontFamily: fontFamilies.displaySemiBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  subtitle: { fontFamily: fontFamilies.displayMedium, fontSize: 18, lineHeight: 25, letterSpacing: -0.2 },
  numeric: { fontFamily: fontFamilies.displayBold, fontSize: 36, lineHeight: 42, letterSpacing: -1 },
  body: { fontFamily: fontFamilies.sansRegular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamilies.sansRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 13.5, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
} as const;

export type TypographyToken = keyof typeof typography;
