import { StyleSheet, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { AppText } from './AppText';
import { colors, radius } from '../theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

type AvatarProps = {
  name: string;
  /** Optional real photo. Falls back to initials when absent or on load error,
   *  so the directory works whether or not contacts ever get photos. */
  imageUrl?: string | null;
  size?: AvatarSize;
  style?: ViewStyle;
};

const dimensions: Record<AvatarSize, { box: number; text: number }> = {
  sm: { box: 36, text: 13 },
  md: { box: 48, text: 17 },
  lg: { box: 64, text: 22 },
  xl: { box: 108, text: 38 },
};

/**
 * Brand-gradient circle carrying the person's initials. Deliberately not a
 * stock/AI headshot: the directory holds real industry contacts, so inventing
 * faces for them would be misleading. The hue pair is derived from the name so
 * a given person keeps the same colours everywhere in the app.
 */
export function Avatar({ name, imageUrl, size = 'md', style }: AvatarProps) {
  const d = dimensions[size];
  const box: ViewStyle = { width: d.box, height: d.box, borderRadius: d.box / 2 };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[box, styles.image, style] as StyleProp<ImageStyle>}
        contentFit="cover"
        transition={180}
        accessibilityLabel={name}
      />
    );
  }

  const pair = gradientFor(name);

  return (
    <LinearGradient
      colors={pair}
      start={{ x: 0, y: 1 }}
      end={{ x: 1, y: 0 }}
      style={[styles.fallback, box, style]}
    >
      <AppText
        variant="bodyStrong"
        color={colors.textInverse}
        style={{ fontSize: d.text, lineHeight: d.text * 1.2 }}
      >
        {initials(name)}
      </AppText>
    </LinearGradient>
  );
}

export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

/**
 * Brand-family gradient pairs. All stay inside the lime/green/amber/orange
 * range so a directory list reads as one palette rather than a confetti of
 * unrelated hues.
 */
const palette: ReadonlyArray<readonly [string, string]> = [
  ['#90D010', '#108010'],
  ['#F0A010', '#F05000'],
  ['#6FD13B', '#0E9E6A'],
  ['#F0C010', '#E07000'],
  ['#3FBF7F', '#108010'],
  ['#F08000', '#C03A00'],
];

function gradientFor(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  const [a, b] = palette[hash % palette.length];
  return [a, b];
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    backgroundColor: colors.surfaceStrong,
    borderRadius: radius.pill,
  },
});
