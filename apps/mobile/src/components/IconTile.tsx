import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, gradients, radius, type GradientToken, type IoniconName } from '../theme';

type IconTileSize = 'sm' | 'md' | 'lg';

type IconTileProps = {
  icon: IoniconName;
  /** Which brand gradient fills the tile. */
  tone?: GradientToken;
  size?: IconTileSize;
  /** Tinted translucent tile with a coloured glyph, instead of a filled
   *  gradient with a dark glyph. Used for list rows where a solid tile would
   *  overpower the text. */
  soft?: boolean;
  /** Directory category badges are circular and softly coloured. */
  circle?: boolean;
  fillColor?: string;
  style?: ViewStyle;
};

const dimensions: Record<IconTileSize, { box: number; glyph: number; radius: number }> = {
  sm: { box: 36, glyph: 18, radius: radius.sm },
  md: { box: 44, glyph: 22, radius: radius.md },
  lg: { box: 56, glyph: 28, radius: radius.lg },
};

/**
 * The coloured rounded-square icon holders used for categories, challenge
 * tracks and the log-activity rows in the mockups.
 */
export function IconTile({ icon, tone = 'brand', size = 'md', soft = false, circle = false, fillColor, style }: IconTileProps) {
  const d = dimensions[size];
  const box: ViewStyle = { width: d.box, height: d.box, borderRadius: circle ? d.box / 2 : d.radius };
  const gradient = gradients[tone];

  if (soft) {
    return (
      <View style={[styles.tile, box, styles.softTile, style]}>
        <Ionicons name={icon} size={d.glyph} color={gradient.colors[0]} />
      </View>
    );
  }

  if (circle) {
    return (
      <View style={[styles.tile, box, styles.circle, { backgroundColor: fillColor ?? colors.accentOrangeSoft }, style]}>
        <Ionicons name={icon} size={d.glyph} color={gradient.colors[gradient.colors.length - 1]} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[...gradient.colors]}
      start={gradient.start}
      end={gradient.end}
      style={[styles.tile, box, style]}
    >
      <Ionicons name={icon} size={d.glyph} color={colors.textInverse} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  softTile: {
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  circle: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
});
