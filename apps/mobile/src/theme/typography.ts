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
/**
 * Sizes measured off the mockups rather than chosen: on a 390pt-wide phone the
 * "Welcome back" headline caps out at ~22pt, i.e. a ~28px face, and it is set
 * Medium — not Bold. An earlier pass used 34px Bold here, which made every
 * screen read as inflated and shouty next to the reference.
 *
 * Headlines use Medium/SemiBold; Bold is reserved for numerals and the few
 * places the mockups genuinely go heavy.
 */
export const typography = {
  hero: { fontFamily: fontFamilies.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: -0.8 },
  display: { fontFamily: fontFamilies.displayMedium, fontSize: 28, lineHeight: 34, letterSpacing: -0.4 },
  title: { fontFamily: fontFamilies.displaySemiBold, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  titleItalic: { fontFamily: fontFamilies.displaySemiBold, fontSize: 21, lineHeight: 27, letterSpacing: -0.3 },
  subtitle: { fontFamily: fontFamilies.displayMedium, fontSize: 17, lineHeight: 23, letterSpacing: -0.2 },
  numeric: { fontFamily: fontFamilies.displayBold, fontSize: 30, lineHeight: 34, letterSpacing: -0.6 },
  body: { fontFamily: fontFamilies.sansRegular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15, lineHeight: 21 },
  caption: { fontFamily: fontFamilies.sansRegular, fontSize: 13, lineHeight: 18 },
  captionStrong: { fontFamily: fontFamilies.sansSemiBold, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fontFamilies.sansMedium, fontSize: 13.5, lineHeight: 18, letterSpacing: 0 },
  button: { fontFamily: fontFamilies.sansSemiBold, fontSize: 15, lineHeight: 20, letterSpacing: -0.1 },
} as const;

export type TypographyToken = keyof typeof typography;
