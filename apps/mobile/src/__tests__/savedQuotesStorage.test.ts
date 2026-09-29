import { loadSavedQuoteIds, storeSavedQuoteIds } from '../services/local/savedQuotes';

const mockStorage = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key: string) => mockStorage.get(key) ?? null),
  setItemAsync: jest.fn(async (key: string, value: string) => { mockStorage.set(key, value); }),
}));

it('restores saved quotes for the same user and isolates other users', async () => {
  mockStorage.clear();
  await storeSavedQuoteIds('user-a', ['quote_1', 'quote_3']);
  expect(await loadSavedQuoteIds('user-a')).toEqual(['quote_1', 'quote_3']);
  expect(await loadSavedQuoteIds('user-b')).toEqual([]);
});
