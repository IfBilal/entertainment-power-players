import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { loadSavedQuoteIds, storeSavedQuoteIds } from '../services/local/savedQuotes';

export function useSavedQuotes() {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const queryKey = ['savedQuotes', userId] as const;
  const query = useQuery({ queryKey, queryFn: () => loadSavedQuoteIds(userId!), enabled: Boolean(userId) });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const ids = query.data ?? [];

  async function toggle(id: string) {
    if (!userId || query.isPending || query.isError || saving) return;
    const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
    setSaving(true);
    setSaveError(false);
    queryClient.setQueryData(queryKey, next);
    try {
      await storeSavedQuoteIds(userId, next);
    } catch {
      queryClient.setQueryData(queryKey, ids);
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  }

  return { ids: new Set(ids), toggle, saving, saveError, query };
}
