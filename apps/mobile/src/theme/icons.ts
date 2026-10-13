import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';
import type MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];
export type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Navigation pictograms, separate from the six-category icon set. Each one
 * is a specific artifact for what the tab actually is -- a contact book, a
 * target, a medal, a quote bubble -- not a generic stock glyph.
 */
export const tabIcons: Record<string, MaterialCommunityIconName> = {
  Directory: 'contacts-outline',
  Tracker: 'bullseye-arrow',
  Challenges: 'medal-outline',
  Inspiration: 'comment-quote-outline',
  Profile: 'account-circle-outline',
};
