import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addFavorite, fetchFavoriteContactIds, removeFavorite } from '../services/supabase/directory';
import { useAuthStore } from '../store/useAuthStore';

const FAVORITES_KEY = ['favorites'];

/**
 * Favourites live in the `favorites` table (RLS: owner-only), not local
 * state — handbook §4.2 wants the toggle on both the list row and the detail
 * screen, and both need to agree across app restarts and devices.
 */
export function useFavorites() {
  const userId = useAuthStore((s) => s.userId);
  const queryClient = useQueryClient();

  const { data: favoriteIds = [] } = useQuery({
    queryKey: FAVORITES_KEY,
    queryFn: () => fetchFavoriteContactIds(userId!),
    enabled: Boolean(userId),
  });

  const mutation = useMutation({
    mutationFn: async ({ contactId, next }: { contactId: string; next: boolean }) => {
      if (!userId) throw new Error('Not signed in');
      if (next) await addFavorite(userId, contactId);
      else await removeFavorite(userId, contactId);
    },
    // Optimistic: the heart should flip instantly, then reconcile. On failure
    // the previous list is restored so the UI never lies about what's saved.
    onMutate: async ({ contactId, next }) => {
      await queryClient.cancelQueries({ queryKey: FAVORITES_KEY });
      const previous = queryClient.getQueryData<string[]>(FAVORITES_KEY) ?? [];
      queryClient.setQueryData<string[]>(
        FAVORITES_KEY,
        next ? [...previous, contactId] : previous.filter((id) => id !== contactId),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(FAVORITES_KEY, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FAVORITES_KEY });
    },
  });

  const isFavorite = useCallback((contactId: string) => favoriteIds.includes(contactId), [favoriteIds]);

  const toggleFavorite = useCallback(
    (contactId: string) => {
      mutation.mutate({ contactId, next: !favoriteIds.includes(contactId) });
    },
    [favoriteIds, mutation],
  );

  return { favoriteIds, isFavorite, toggleFavorite };
}
