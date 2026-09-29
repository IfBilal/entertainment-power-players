import { useUserActivity } from './useUserActivity';
import { useChallengeProgress } from './useChallengeProgress';
import { completedChallengeEntries } from '../services/supabase/challenges';

export function useTrackerEntries() {
  const activityQuery = useUserActivity();
  const challengeQuery = useChallengeProgress();
  const completed = completedChallengeEntries(challengeQuery.data ?? {});
  const completedTitles = new Set(completed.map((entry) => entry.title));
  const entries = [
    ...(activityQuery.data ?? []).filter((entry) => entry.type !== 'challenge' || !completedTitles.has(entry.title)),
    ...completed,
  ];
  return { entries, activityQuery, challengeQuery };
}
