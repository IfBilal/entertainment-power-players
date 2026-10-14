import type { MaterialCommunityIconName } from './icons';

/**
 * Picks for the user's own profile icon -- a characterized stand-in for a
 * photo, not a fake face. Kept separate from the category icon map
 * (CategoryGlyph.tsx), which is scoped to the supervisor-approved industry
 * set: these are personal identity choices, unrelated to any track.
 */
export const avatarIconIds: MaterialCommunityIconName[] = [
  'robot-happy-outline',
  'panda',
  'koala',
  'owl',
  'penguin',
  'cat',
  'rabbit-variant',
  'unicorn-variant',
  'turtle',
  'elephant',
  'teddy-bear',
  'ghost-outline',
  'wizard-hat',
  'alien-outline',
  'ninja',
  'bee',
];

export function isAvatarIconId(value: string | null | undefined): value is MaterialCommunityIconName {
  return typeof value === 'string' && (avatarIconIds as string[]).includes(value);
}
