import { favoritesQueryKey } from '../hooks/useFavorites';

it('keeps contact favorites caches separate for each account', () => {
  expect(favoritesQueryKey('user-a')).not.toEqual(favoritesQueryKey('user-b'));
});
