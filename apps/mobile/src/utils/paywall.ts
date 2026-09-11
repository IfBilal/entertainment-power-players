/**
 * Directory records and challenges are behind the paid subscription; category
 * names, track names and quotes are visible to free users (handbook §1).
 * Pure gate function so the rule is unit-testable independent of navigation.
 */
export type GatedScreen = 'directoryContactList' | 'challengeTrackDetail' | 'categoryGrid' | 'trackList' | 'inspiration';

const FREE_SCREENS: GatedScreen[] = ['categoryGrid', 'trackList', 'inspiration'];

export function isScreenLocked(screen: GatedScreen, isPro: boolean): boolean {
  if (isPro) return false;
  return !FREE_SCREENS.includes(screen);
}
