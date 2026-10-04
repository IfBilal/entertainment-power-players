import { fontFamilies } from './fonts';

/** Inter throughout; confident hierarchy and larger action text for the light UI. */
export const typography = {
  hero: { fontFamily: fontFamilies.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  display: { fontFamily: fontFamilies.displayMedium, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fontFamilies.displaySemiBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  titleItalic: { fontFamily: fontFamilies.displaySemiBold, fontSize: 26, lineHeight: 32, letterSpacing: -0.4 },
  subtitle: { fontFamily: fontFamilies.displayMedium, fontSize: 18, lineHeight: 25, letterSpacing: -0.2 },
  numeric: { fontFamily: fontFamilies.displayBold, fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  body: { fontFamily: fontFamilies.sansRegular, fontSize: 16, lineHeight: 24 },
  bodyStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 16, lineHeight: 24 },
  caption: { fontFamily: fontFamilies.sansRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 13.5, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.1 },
} as const;

export type TypographyToken = keyof typeof typography;
