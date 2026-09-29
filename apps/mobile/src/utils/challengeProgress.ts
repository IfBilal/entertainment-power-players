export type ChallengeProgress = {
  status: 'not_started' | 'complete';
  count: number;
  note?: string;
  completedAt?: string;
};

/** During the old-APK compatibility window, data may have only a position key. */
export type ChallengeProgressMap = Record<string, ChallengeProgress>;

export function legacyChallengeKey(trackSlug: string, challengeOrder: number): string {
  return `${trackSlug}_${challengeOrder}`;
}
