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
  /**
   * Primary CTA. Sampled off the mockups' buttons, which run
   * #76D138 -> #98BE2B -> #E99D23 -> #FB5B05: the ramp passes through amber
   * rather than interpolating lime straight to orange. That middle stop is
   * what makes it read as a glow — a direct two-stop blend goes through a
   * muddy olive-brown instead.
   */
  brand: {
    colors: ['#75DA3D', '#9CBB2A', '#F27C10', '#FC5D06'] as const,
    locations: [0, 0.38, 0.62, 1] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  /** Same ramp, vertical — for progress fills and tall elements. */
  brandVertical: {
    colors: ['#75DA3D', '#9CBB2A', '#F27C10', '#FC5D06'] as const,
    locations: [0, 0.38, 0.62, 1] as const,
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  /** Warmer weighting, for larger surfaces that should lean orange. */
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
    { color: 'rgba(144, 208, 16, 0.20)', top: '-48%', left: '-52%', size: '120%' },
    { color: 'rgba(240, 80, 0, 0.16)', bottom: '-48%', right: '-52%', size: '115%' },
  ],
  /** Warmer, for auth and onboarding screens. In the mockups this is barely
   *  there — a faint wash at the very corners, not a coloured stain. */
  warm: [
    { color: 'rgba(240, 160, 16, 0.18)', top: '-50%', right: '-50%', size: '115%' },
    { color: 'rgba(240, 80, 0, 0.15)', bottom: '-50%', left: '-52%', size: '115%' },
  ],
  /** Cooler/greener, for content-dense screens where accent should recede. */
  subtle: [
    { color: 'rgba(144, 208, 16, 0.12)', top: '-50%', left: '-52%', size: '110%' },
    { color: 'rgba(16, 128, 16, 0.12)', bottom: '-50%', right: '-52%', size: '110%' },
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
