import type { ComponentProps } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type GlyphName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * One characterized artifact per industry, not a generic stock glyph.
 * Fashion and Sports are the client's literal icon picks (2 Oct feedback:
 * sunglasses for Fashion, basketball for Sports); the rest keep the earlier
 * characterized set.
 */
const icons: Record<string, GlyphName> = {
  fashion: 'sunglasses',
  'film-tv': 'movie-open',
  gaming: 'controller-classic',
  music: 'album',
  sports: 'basketball',
  'creators-producers': 'movie-edit',
};

/** Server icon names cannot override the supervisor-approved category set. */
export function CategoryGlyph({ slug, size, color }: { slug: string; size: number; color: string }) {
  return <MaterialCommunityIcons name={icons[slug] ?? 'shape-outline'} size={size} color={color} />;
}
