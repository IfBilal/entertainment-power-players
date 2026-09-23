import { fontFamilies } from './fonts';

/**
 * A single grotesk (Inter) across the whole scale, with hierarchy carried by
 * size and weight rather than a second family. Display sizes run tight
 * (negative tracking) to match the mockups' headline treatment; running text
 * stays at normal tracking for legibility on a dark ground.
 *
 * Weight lives in the font file, never in a separate `fontWeight` — mixing RN's
 * synthetic bold with a real bold cut produces faux-bold artifacts.
 */
export const typography = {
  hero: { fontFamily: fontFamilies.displayBold, fontSize: 40, lineHeight: 46, letterSpacing: -1.2 },
  display: { fontFamily: fontFamilies.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.9 },
  title: { fontFamily: fontFamilies.displaySemiBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  titleItalic: { fontFamily: fontFamilies.displaySemiBold, fontSize: 24, lineHeight: 30, letterSpacing: -0.5 },
  subtitle: { fontFamily: fontFamilies.displayMedium, fontSize: 19, lineHeight: 25, letterSpacing: -0.2 },
  numeric: { fontFamily: fontFamilies.displayBold, fontSize: 32, lineHeight: 36, letterSpacing: -0.8 },
  body: { fontFamily: fontFamilies.sansRegular, fontSize: 15.5, lineHeight: 22 },
  bodyStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15.5, lineHeight: 22 },
  caption: { fontFamily: fontFamilies.sansRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamilies.sansSemiBold, fontSize: 11.5, lineHeight: 15, letterSpacing: 1.1 },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15.5, lineHeight: 20, letterSpacing: -0.1 },
} as const;

export type TypographyToken = keyof typeof typography;
