import { colors } from './colors';

/**
 * The brand gradient runs lime -> orange on a shallow diagonal, matching the
 * logo's star and every primary CTA in the mockups. Defined once here so the
 * angle and stops stay identical across buttons, progress rings, charts and
 * tiles — a gradient that drifts between components is the fastest way to make
 * a design system look homemade.
 *
 * `start`/`end` are expo-linear-gradient's unit-square coordinates; the default
 * pair below is the ~100deg sweep used on buttons.
 */
export const gradients = {
  /** Primary CTA: lime -> orange, left to right with a slight rise. */
  brand: {
    colors: [colors.accentLime, colors.accentOrange] as const,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  /** Same hues, vertical — for progress fills and tall elements. */
  brandVertical: {
    colors: [colors.accentLime, colors.accentOrange] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  /** Three-stop version passing through amber, for larger surfaces. */
  brandWarm: {
    colors: [colors.accentLime, colors.accentAmber, colors.accentOrange] as const,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  /** Deep green -> lime, for secondary/"success" emphasis. */
  green: {
    colors: [colors.accentDeep, colors.accentLime] as const,
    start: { x: 0, y: 1 },
    end: { x: 1, y: 0 },
  },
  /** Amber -> orange, for the star mark and warning emphasis. */
  ember: {
    colors: [colors.accentAmber, colors.accentOrange] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  /** Card wash: a barely-there lift so cards read above the background. */
  cardSheen: {
    colors: ['rgba(255, 255, 255, 0.06)', 'rgba(255, 255, 255, 0.015)'] as const,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  /** Scrim placed over photography so text stays legible on top of it. */
  photoScrim: {
    colors: ['rgba(5, 15, 17, 0)', 'rgba(5, 15, 17, 0.75)', colors.background] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
} as const;

export type GradientToken = keyof typeof gradients;

/**
 * Aurora light-leaks — the soft coloured blooms that bleed in from the screen
 * corners in every mockup. Rendered as large, heavily-blurred radial blobs
 * behind content. Values are percentages of the screen box so they scale with
 * device size.
 */
export const auroras = {
  /** Default: lime top-left, orange bottom-right. Blobs run well past the
   *  screen edge so only the soft middle of the falloff is ever visible. */
  standard: [
    { color: 'rgba(144, 208, 16, 0.42)', top: '-38%', left: '-45%', size: '115%' },
    { color: 'rgba(240, 80, 0, 0.38)', bottom: '-38%', right: '-45%', size: '110%' },
  ],
  /** Warmer, for auth and onboarding screens. */
  warm: [
    { color: 'rgba(240, 160, 16, 0.45)', top: '-40%', right: '-42%', size: '115%' },
    { color: 'rgba(240, 80, 0, 0.42)', bottom: '-36%', left: '-45%', size: '115%' },
  ],
  /** Cooler/greener, for content-dense screens where accent should recede. */
  subtle: [
    { color: 'rgba(144, 208, 16, 0.26)', top: '-42%', left: '-48%', size: '110%' },
    { color: 'rgba(16, 128, 16, 0.26)', bottom: '-42%', right: '-48%', size: '110%' },
  ],
} as const;

export type AuroraToken = keyof typeof auroras;

/**
 * Glow presets for active/selected states (the bloom under the selected tab
 * icon, the ring around a selected track tile).
 */
export const glows = {
  lime: {
    shadowColor: colors.accentLime,
    shadowOpacity: 0.55,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
  },
  orange: {
    shadowColor: colors.accentOrange,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },
  amber: {
    shadowColor: colors.accentAmber,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },
} as const;

export type GlowToken = keyof typeof glows;
