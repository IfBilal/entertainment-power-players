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
  /**
   * The three weekly-progress bar fills, sampled off mockup 9: contacts run
   * amber, events lime, follow-ups orange. Each stays within its own hue
   * rather than sweeping the full brand ramp, so the three bars stay
   * distinguishable at a glance.
   */
  barAmber: {
    colors: ['#FE9804', '#FDB90B'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  barLime: {
    colors: ['#5FBF1C', '#77D221'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  barOrange: {
    colors: ['#FA6100', '#FF7A1A'] as const,
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
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
} as const;

export type GradientToken = keyof typeof gradients;

