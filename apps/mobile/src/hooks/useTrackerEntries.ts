import { useUserActivity } from './useUserActivity';

export function useTrackerEntries() {
  const activityQuery = useUserActivity();
  return { entries: activityQuery.data ?? [], activityQuery };
}
