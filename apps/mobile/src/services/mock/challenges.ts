import seedData from './challenges-seed.json';

export type ChallengeType = 'single' | 'counter';

export type Challenge = {
  id: string;
  order: number;
  title: string;
  description: string;
  type: ChallengeType;
  target?: number;
};

export type Track = {
  slug: string;
  name: string;
  order: number;
  active: boolean;
  challenges: Challenge[];
};

type SeedTrack = Omit<Track, 'challenges'> & { challenges: Omit<Challenge, 'id'>[] };

export const tracks: Track[] = (seedData.tracks as SeedTrack[]).map((track) => ({
  ...track,
  challenges: track.challenges.map((challenge) => ({
    ...challenge,
    id: `${track.slug}_${challenge.order}`,
  })),
}));

export type ChallengeProgress = {
  status: 'not_started' | 'complete';
  count: number;
  note?: string;
  completedAt?: string;
};

export type ChallengeProgressMap = Record<string, ChallengeProgress>;

export function trackCompletionCount(track: Track, progress: ChallengeProgressMap): { done: number; total: number } {
  const total = track.challenges.length;
  const done = track.challenges.filter((c) => progress[c.id]?.status === 'complete').length;
  return { done, total };
}

/**
 * Applies a tap on a `single` challenge (toggle) or an increment/decrement on a
 * `counter` challenge, per handbook §4.4. Counter challenges auto-complete when
 * `count` reaches `target` and stop there; decrementing below target reopens it.
 */
export function applyChallengeAction(
  challenge: Challenge,
  current: ChallengeProgress | undefined,
  action: 'toggle' | 'increment' | 'decrement',
): ChallengeProgress {
  const base: ChallengeProgress = current ?? { status: 'not_started', count: 0 };

  if (challenge.type === 'single') {
    return base.status === 'complete' ? { ...base, status: 'not_started', count: 0, completedAt: undefined } : { ...base, status: 'complete', count: 1 };
  }

  const target = challenge.target ?? 1;
  const delta = action === 'decrement' ? -1 : 1;
  const nextCount = Math.max(0, Math.min(target, base.count + delta));
  return {
    ...base,
    count: nextCount,
    status: nextCount >= target ? 'complete' : 'not_started',
    completedAt: nextCount >= target ? base.completedAt : undefined,
  };
}
