import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { IoniconName } from '../theme';

const icons: Record<string, IoniconName> = {
  'film-tv': 'film-outline',
  gaming: 'game-controller-outline',
  music: 'musical-notes-outline',
  sports: 'basketball-outline',
  'creators-producers': 'sparkles-outline',
};

/** Server icon names cannot override the supervisor-approved category set. */
export function CategoryGlyph({ slug, size, color }: { slug: string; size: number; color: string }) {
  if (slug === 'fashion') {
    return <MaterialCommunityIcons name="sunglasses" size={size} color={color} />;
  }
  return <Ionicons name={icons[slug] ?? 'shapes-outline'} size={size} color={color} />;
}
