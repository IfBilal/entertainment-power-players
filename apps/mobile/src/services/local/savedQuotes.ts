import * as SecureStore from 'expo-secure-store';

function storageKey(userId: string) {
  return `epp_saved_quotes_${userId}`;
}

export async function loadSavedQuoteIds(userId: string): Promise<string[]> {
  const raw = await SecureStore.getItemAsync(storageKey(userId));
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
}

export async function storeSavedQuoteIds(userId: string, ids: string[]): Promise<void> {
  await SecureStore.setItemAsync(storageKey(userId), JSON.stringify(ids));
}
