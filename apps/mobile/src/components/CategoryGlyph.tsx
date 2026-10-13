import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type GlyphName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * One characterized artifact per industry, not a generic stock glyph --
 * a clapboard for film, a vinyl record for music, a trophy for sports, the
 * way Harry Potter merch uses a wand or house scarf instead of a plain icon.
 */
const icons: Record<string, GlyphName> = {
  fashion: 'hanger',
  'film-tv': 'movie-open',
  gaming: 'controller-classic',
  music: 'album',
  sports: 'trophy',
  'creators-producers': 'movie-edit',
};

/** Server icon names cannot override the supervisor-approved category set. */
export function CategoryGlyph({ slug, size, color }: { slug: string; size: number; color: string }) {
  return <MaterialCommunityIcons name={icons[slug] ?? 'shape-outline'} size={size} color={color} />;
}
