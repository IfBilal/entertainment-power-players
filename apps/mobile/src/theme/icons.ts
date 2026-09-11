import type { ComponentProps } from 'react';
import type Ionicons from '@expo/vector-icons/Ionicons';

export type IoniconName = ComponentProps<typeof Ionicons>['name'];

/**
 * Category icon options for admin sign-off (handbook §1 Week 1: "icon set options
 * prepared for category selection"). Each category lists a default plus alternates;
 * the admin panel picks from this bundled set (handbook §5: "icon selection from
 * the bundled icon set"). See docs/icon-options.md for the visual rationale.
 */
export const categoryIconOptions: Record<string, { default: IoniconName; alternates: IoniconName[] }> = {
  fashion: { default: 'glasses-outline', alternates: ['shirt-outline', 'diamond-outline'] },
  filmTv: { default: 'film-outline', alternates: ['videocam-outline', 'tv-outline'] },
  gaming: { default: 'game-controller-outline', alternates: ['headset-outline', 'planet-outline'] },
  music: { default: 'musical-notes-outline', alternates: ['mic-outline', 'headset-outline'] },
  sports: { default: 'trophy-outline', alternates: ['american-football-outline', 'basketball-outline'] },
};

export const categorySlugToKey: Record<string, keyof typeof categoryIconOptions> = {
  fashion: 'fashion',
  'film-tv': 'filmTv',
  gaming: 'gaming',
  music: 'music',
  sports: 'sports',
};

export const tabIcons: Record<string, IoniconName> = {
  Directory: 'people-outline',
  Tracker: 'stats-chart-outline',
  Challenges: 'checkmark-done-outline',
  Inspiration: 'sparkles-outline',
  Profile: 'person-outline',
};
