import { useQuery } from '@tanstack/react-query';
import { fetchUserGoals, goalsQueryKey } from '../services/supabase/goals';
import { useAuthStore } from '../store/useAuthStore';

export function useUserGoals() {
  const userId = useAuthStore((state) => state.userId);
  return useQuery({
    queryKey: goalsQueryKey(userId),
    queryFn: () => fetchUserGoals(userId!),
    enabled: Boolean(userId),
  });
}
