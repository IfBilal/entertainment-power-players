import { create } from 'zustand';
import { applyChallengeAction, challengeKey, type Challenge, type ChallengeProgressMap } from '../services/mock/challenges';

type ChallengesState = {
  progress: ChallengeProgressMap;
  act: (trackSlug: string, challenge: Challenge, action: 'toggle' | 'increment' | 'decrement') => void;
};

export const useChallengesStore = create<ChallengesState>((set, get) => ({
  progress: {},
  act: (trackSlug, challenge, action) => {
    const key = challengeKey(trackSlug, challenge.order);
    const next = applyChallengeAction(challenge, get().progress[key], action);
    set({ progress: { ...get().progress, [key]: next } });
  },
}));
