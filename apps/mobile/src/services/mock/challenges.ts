import seedData from './challenges-seed.json';

export type ChallengeType = 'single' | 'counter';

export type Challenge = {
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

export const tracks: Track[] = seedData.tracks as Track[];

export type ChallengeProgress = {
  status: 'not_started' | 'complete';
  count: number;
};

export type ChallengeProgressMap = Record<string, ChallengeProgress>;

export function challengeKey(trackSlug: string, challengeOrder: number): string {
  return `${trackSlug}_${challengeOrder}`;
}

export function trackCompletionCount(track: Track, progress: ChallengeProgressMap): { done: number; total: number } {
  const total = track.challenges.length;
  const done = track.challenges.filter((c) => progress[challengeKey(track.slug, c.order)]?.status === 'complete').length;
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
    return base.status === 'complete' ? { status: 'not_started', count: 0 } : { status: 'complete', count: 1 };
  }

  const target = challenge.target ?? 1;
  const delta = action === 'decrement' ? -1 : 1;
  const nextCount = Math.max(0, Math.min(target, base.count + delta));
  return {
    count: nextCount,
    status: nextCount >= target ? 'complete' : 'not_started',
  };
}
