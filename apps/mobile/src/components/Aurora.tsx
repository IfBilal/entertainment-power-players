import { StyleSheet, View, type DimensionValue } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import { auroras, type AuroraToken } from '../theme';

type AuroraProps = {
  variant?: AuroraToken;
};

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
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {auroras[variant].map((blob, i) => {
        const id = `aurora-${variant}-${i}`;
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
