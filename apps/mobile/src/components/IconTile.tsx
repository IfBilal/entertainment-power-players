import { StyleSheet, View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { CategoryGlyph } from './CategoryGlyph';
import { colors, gradients, radius, type GradientToken, type IoniconName, type MaterialCommunityIconName } from '../theme';

type IconTileSize = 'sm' | 'md' | 'lg';

type IconTileProps = {
  icon: IoniconName | MaterialCommunityIconName;
  /** Defaults to Ionicons; set 'mci' to render `icon` from MaterialCommunityIcons instead,
   *  for a more specific artifact than Ionicons' outline set offers. */
  iconFamily?: 'ionicons' | 'mci';
  categorySlug?: string;
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
  glyphColor?: string;
  style?: ViewStyle;
};

const dimensions: Record<IconTileSize, { box: number; glyph: number; radius: number }> = {
  sm: { box: 36, glyph: 18, radius: radius.sm },
  md: { box: 44, glyph: 22, radius: radius.md },
  lg: { box: 60, glyph: 30, radius: radius.lg },
};

/** Category medallions and small action icon holders on the white UI. */
export function IconTile({ icon, iconFamily = 'ionicons', categorySlug, tone = 'brand', size = 'md', soft = false, circle = false, fillColor, glyphColor, style }: IconTileProps) {
  const d = dimensions[size];
  const box: ViewStyle = { width: d.box, height: d.box, borderRadius: circle ? d.box / 2 : d.radius };
  const gradient = gradients[tone];

  function Glyph({ color }: { color: string }) {
    return iconFamily === 'mci'
      ? <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={d.glyph} color={color} />
      : <Ionicons name={icon as IoniconName} size={d.glyph} color={color} />;
  }

  if (soft) {
    return (
      <View style={[styles.tile, box, styles.softTile, style]}>
        {categorySlug ? <CategoryGlyph slug={categorySlug} size={d.glyph} color={colors.accent} /> : <Glyph color={gradient.colors[0]} />}
      </View>
    );
  }

  if (circle) {
    return (
      <View style={[styles.tile, box, { backgroundColor: fillColor ?? colors.accent }, style]}>
        {categorySlug ? <CategoryGlyph slug={categorySlug} size={d.glyph} color={glyphColor ?? colors.textInverse} /> : <Glyph color={glyphColor ?? colors.textInverse} />}
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
      {categorySlug ? <CategoryGlyph slug={categorySlug} size={d.glyph} color={colors.textInverse} /> : <Glyph color={colors.textInverse} />}
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
});
