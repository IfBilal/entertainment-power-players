import { migrateLocalQuoteFavorites } from '../services/supabase/quoteFavorites';
import { supabase } from '../services/supabase/client';

const mockSecureStorage = new Map<string, string>();
const mockLocalByUser: Record<string, string[]> = {
  'user-a': ['quote_1', 'quote_1', 'missing'],
  'user-b': ['quote_2'],
};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockSecureStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => { mockSecureStorage.set(key, value); }),
}));
jest.mock('../services/local/savedQuotes', () => ({ loadSavedQuoteIds: jest.fn(async (userId: string) => mockLocalByUser[userId] ?? []) }));
jest.mock('../services/supabase/client', () => ({ supabase: { from: jest.fn() } }));

it('imports only valid local saves for each account once', async () => {
  mockSecureStorage.clear();
  const upsert = jest.fn(async () => ({ error: null }));
  (supabase.from as jest.Mock).mockReturnValue({ upsert });
  await migrateLocalQuoteFavorites('user-a', ['quote_1', 'quote_2']);
  await migrateLocalQuoteFavorites('user-a', ['quote_1', 'quote_2']);
  await migrateLocalQuoteFavorites('user-b', ['quote_1', 'quote_2']);
  expect(upsert).toHaveBeenCalledTimes(2);
  expect(upsert).toHaveBeenNthCalledWith(1, [{ user_id: 'user-a', quote_id: 'quote_1' }], { onConflict: 'user_id,quote_id' });
  expect(upsert).toHaveBeenNthCalledWith(2, [{ user_id: 'user-b', quote_id: 'quote_2' }], { onConflict: 'user_id,quote_id' });
});

it('does not mark migration complete after a server error', async () => {
  mockSecureStorage.clear();
  const upsert = jest.fn().mockResolvedValueOnce({ error: new Error('offline') }).mockResolvedValueOnce({ error: null });
  (supabase.from as jest.Mock).mockReturnValue({ upsert });
  await expect(migrateLocalQuoteFavorites('user-a', ['quote_1'])).rejects.toThrow('offline');
  await migrateLocalQuoteFavorites('user-a', ['quote_1']);
  expect(upsert).toHaveBeenCalledTimes(2);
});
