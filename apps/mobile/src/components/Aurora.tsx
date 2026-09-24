import { useId } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Svg, { Defs, Line, LinearGradient, Polygon, RadialGradient, Rect, Stop } from 'react-native-svg';
import { auroras, type AuroraToken } from '../theme';

type AuroraProps = {
  variant?: AuroraToken | 'streaks';
};

/**
 * Sharp diagonal light beams sweeping in from the top-right and bottom-left,
 * as on the mockups' reset-password screen — a different treatment from the
 * soft corner blobs, so it gets its own variant rather than new blob values.
 */
function Streaks() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          {/* Each beam fades to nothing well before it reaches the content, so
              it reads as a glow catching the edge of the screen rather than a
              solid wedge of colour laid over it. */}
          <LinearGradient id="streakWarm" x1="1" y1="0" x2="0.1" y2="0.9">
            <Stop offset="0" stopColor="#F05000" stopOpacity={0.30} />
            <Stop offset="0.28" stopColor="#F0A010" stopOpacity={0.10} />
            <Stop offset="0.6" stopColor="#90D010" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id="streakGreen" x1="0" y1="1" x2="0.9" y2="0.1">
            <Stop offset="0" stopColor="#F05000" stopOpacity={0.26} />
            <Stop offset="0.3" stopColor="#90D010" stopOpacity={0.12} />
            <Stop offset="0.65" stopColor="#108010" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        {/* upper-right beam */}
        <Polygon points="390,-60 390,210 190,-60" fill="url(#streakWarm)" />
        <Polygon points="390,40 390,250 288,-20" fill="url(#streakWarm)" opacity={0.5} />
        {/* lower-left beam */}
        <Polygon points="0,904 0,624 300,904" fill="url(#streakGreen)" />
        <Polygon points="40,904 0,700 210,904" fill="url(#streakGreen)" opacity={0.55} />
      </Svg>
    </View>
  );
}

/**
 * Fine diagonal brand light-leaks used across the main-screen mockups. The
 * low-contrast bands and hairlines sit at the canvas edges, so they add depth
 * without reducing text contrast or competing with cards.
 */
function BrandLines() {
  const id = `brand-lines-${useId().replace(/:/g, '')}`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 390 844" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id={`${id}-top`} x1="1" y1="0" x2="0.12" y2="0.9">
            <Stop offset="0" stopColor="#F05000" stopOpacity={0.24} />
            <Stop offset="0.22" stopColor="#F0A010" stopOpacity={0.12} />
            <Stop offset="0.54" stopColor="#90D010" stopOpacity={0.045} />
            <Stop offset="1" stopColor="#90D010" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id={`${id}-bottom`} x1="0" y1="1" x2="0.9" y2="0.08">
            <Stop offset="0" stopColor="#F05000" stopOpacity={0.19} />
            <Stop offset="0.24" stopColor="#F0A010" stopOpacity={0.10} />
            <Stop offset="0.58" stopColor="#90D010" stopOpacity={0.035} />
            <Stop offset="1" stopColor="#90D010" stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Polygon points="390,-48 390,262 166,-48" fill={`url(#${id}-top)`} />
        <Polygon points="390,46 390,258 294,-26" fill={`url(#${id}-top)`} opacity={0.58} />
        <Polygon points="0,892 0,630 286,892" fill={`url(#${id}-bottom)`} />
        <Polygon points="36,892 0,712 198,892" fill={`url(#${id}-bottom)`} opacity={0.55} />
        <Line x1="390" y1="30" x2="213" y2="207" stroke="#F0A010" strokeOpacity={0.18} strokeWidth={1} />
        <Line x1="0" y1="818" x2="258" y2="844" stroke="#90D010" strokeOpacity={0.15} strokeWidth={1} />
      </Svg>
    </View>
  );
}

/**
 * The soft coloured blooms that bleed in from the screen corners throughout the
 * mockups.
 *
 * Each blob is an SVG rect filled with a true radial gradient that fades to
 * fully transparent at the edge. An earlier version faked this with a circular
 * View + linear gradient, which produced a visible hard circular edge — a
 * radial gradient is the only way to get a falloff with no seam.
 *
 * Purely decorative: `pointerEvents="none"` so it never eats a touch.
 */
export function Aurora({ variant = 'standard' }: AuroraProps) {
  const instanceId = useId().replace(/:/g, '');
  if (variant === 'streaks') return <Streaks />;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <BrandLines />
      {auroras[variant].map((blob, i) => {
        const id = `aurora-${variant}-${i}-${instanceId}`;
        const position = {
          top: 'top' in blob ? (blob.top as DimensionValue) : undefined,
          bottom: 'bottom' in blob ? (blob.bottom as DimensionValue) : undefined,
          left: 'left' in blob ? (blob.left as DimensionValue) : undefined,
          right: 'right' in blob ? (blob.right as DimensionValue) : undefined,
        };

        return (
          <View
            key={id}
            style={[styles.blob, position, { width: blob.size as DimensionValue, aspectRatio: 1 }]}
          >
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id={id} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={blob.color} stopOpacity={1} />
                  <Stop offset="0.55" stopColor={blob.color} stopOpacity={0.45} />
                  <Stop offset="1" stopColor={blob.color} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
            </Svg>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: 'absolute',
  },
});
