import { useQuery } from '@tanstack/react-query';
import { activityQueryKey, fetchUserActivity } from '../services/supabase/activity';
import { useAuthStore } from '../store/useAuthStore';

export function useUserActivity() {
  const userId = useAuthStore((state) => state.userId);
  return useQuery({
    queryKey: activityQueryKey(userId),
    queryFn: () => fetchUserActivity(userId!),
    enabled: Boolean(userId),
  });
}
