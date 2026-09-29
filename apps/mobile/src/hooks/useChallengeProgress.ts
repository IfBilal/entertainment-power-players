import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { challengeProgressQueryKey, fetchChallengeProgress } from '../services/supabase/challenges';

export function useChallengeProgress() {
  const userId = useAuthStore((state) => state.userId);
  return useQuery({
    queryKey: challengeProgressQueryKey(userId),
    queryFn: () => fetchChallengeProgress(userId!),
    enabled: Boolean(userId),
  });
}
