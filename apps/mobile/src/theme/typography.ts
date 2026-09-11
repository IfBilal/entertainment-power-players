import { fontFamilies } from './fonts';

/**
 * Headline variants use the editorial serif (Fraunces); everything read as
 * running text or UI chrome uses Inter. Font weight lives entirely in the
 * chosen font file, not a separate `fontWeight` — mixing RN's synthetic bold
 * with a real bold font file produces faux-bold artifacts on some platforms.
 */
export const typography = {
  display: { fontFamily: fontFamilies.serifSemiBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.4 },
  title: { fontFamily: fontFamilies.serifSemiBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  titleItalic: { fontFamily: fontFamilies.serifSemiBoldItalic, fontSize: 24, lineHeight: 30 },
  subtitle: { fontFamily: fontFamilies.serifMedium, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: fontFamilies.sansRegular, fontSize: 15.5, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15.5, lineHeight: 22 },
  caption: { fontFamily: fontFamilies.sansRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.1 },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15.5, lineHeight: 20 },
} as const;

export type TypographyToken = keyof typeof typography;
