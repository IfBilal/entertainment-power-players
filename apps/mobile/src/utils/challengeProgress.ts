export type ChallengeProgress = {
  status: 'not_started' | 'complete';
  count: number;
  note?: string;
  completedAt?: string;
};

/** Progress keys are immutable challenge IDs; display order is never identity. */
export type ChallengeProgressMap = Record<string, ChallengeProgress>;
