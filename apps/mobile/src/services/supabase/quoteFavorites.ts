import * as SecureStore from 'expo-secure-store';
import { supabase } from './client';
import { loadSavedQuoteIds } from '../local/savedQuotes';

export function quoteFavoritesQueryKey(userId: string | null) {
  return ['quoteFavorites', userId] as const;
}

export async function fetchQuoteFavoriteIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase.from('quote_favorites').select('quote_id').eq('user_id', userId);
  if (error) throw error;
  return (data ?? []).map((row) => row.quote_id);
}

export async function setQuoteFavorite(userId: string, quoteId: string, saved: boolean): Promise<void> {
  if (saved) {
    const { error } = await supabase.from('quote_favorites').upsert({ user_id: userId, quote_id: quoteId }, { onConflict: 'user_id,quote_id' });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('quote_favorites').delete().eq('user_id', userId).eq('quote_id', quoteId);
    if (error) throw error;
  }
}

/** Imports only known active quote IDs, once for this signed-in account. */
export async function migrateLocalQuoteFavorites(userId: string, activeQuoteIds: string[]): Promise<void> {
  if (activeQuoteIds.length === 0) return;
  const marker = `epp_quote_favorites_migrated_${userId}`;
  if (await SecureStore.getItemAsync(marker)) return;
  const local = await loadSavedQuoteIds(userId);
  const active = new Set(activeQuoteIds);
  const validIds = [...new Set(local)].filter((id) => active.has(id));
  if (validIds.length) {
    const { error } = await supabase.from('quote_favorites').upsert(
      validIds.map((quoteId) => ({ user_id: userId, quote_id: quoteId })),
      { onConflict: 'user_id,quote_id' },
    );
    if (error) throw error;
  }
  await SecureStore.setItemAsync(marker, '1');
}
