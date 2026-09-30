import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useQuotes } from './useContent';
import { fetchQuoteFavoriteIds, migrateLocalQuoteFavorites, quoteFavoritesQueryKey, setQuoteFavorite } from '../services/supabase/quoteFavorites';

export function useSavedQuotes() {
  const userId = useAuthStore((state) => state.userId);
  const quotes = useQuotes();
  const queryClient = useQueryClient();
  const queryKey = quoteFavoritesQueryKey(userId);
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      await migrateLocalQuoteFavorites(userId!, (quotes.data ?? []).map((quote) => quote.id));
      return fetchQuoteFavoriteIds(userId!);
    },
    enabled: Boolean(userId) && quotes.isSuccess,
    refetchInterval: process.env.NODE_ENV === 'test' ? false : 10_000,
    refetchOnMount: 'always',
  });
  const savingRef = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const ids = query.data ?? [];

  async function toggle(id: string) {
    if (!userId || query.isPending || query.isError || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(false);
    try {
      const wasSaved = ids.includes(id);
      await setQuoteFavorite(userId, id, !wasSaved);
      queryClient.setQueryData<string[]>(queryKey, (previous) => wasSaved
        ? (previous ?? []).filter((item) => item !== id)
        : [...(previous ?? []), id]);
    } catch {
      setSaveError(true);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return { ids: new Set(ids), toggle, saving, saveError, query, quotes };
}
