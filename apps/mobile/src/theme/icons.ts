import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/** Navigation pictograms are separate from the fixed five-category icon set. */
export const tabIcons: Record<string, IoniconName> = {
  Directory: 'people-outline',
  Tracker: 'stats-chart-outline',
  Challenges: 'checkmark-done-outline',
  Inspiration: 'sparkles-outline',
  Profile: 'person-outline',
};
