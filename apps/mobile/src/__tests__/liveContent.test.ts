import { supabase } from '../services/supabase/client';
import { fetchActiveChallenges, fetchActiveQuotes, fetchActiveTracks } from '../services/supabase/content';

jest.mock('../services/supabase/client', () => ({ supabase: { from: jest.fn() } }));

function respondWith(data: Record<string, unknown>[]) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    then: (resolve: (result: { data: typeof data; error: null }) => unknown) =>
      Promise.resolve({ data, error: null }).then(resolve),
  };
  query.select.mockReturnValue(query);
  query.eq.mockReturnValue(query);
  query.order.mockReturnValue(query);
  (supabase.from as jest.Mock).mockReturnValue(query);
  return query;
}

beforeEach(() => jest.clearAllMocks());

it('loads active track names from the server in admin order', async () => {
  const query = respondWith([{ slug: 'music', name: 'Music', order: 2, active: true }]);
  expect(await fetchActiveTracks()).toEqual([{ slug: 'music', name: 'Music', order: 2, active: true }]);
  expect(supabase.from).toHaveBeenCalledWith('tracks');
  expect(query.eq).toHaveBeenCalledWith('active', true);
  expect(query.order).toHaveBeenCalledWith('order');
});

it('maps stable challenge IDs separately from presentation order', async () => {
  const query = respondWith([{
    id: 'challenge-stable', track_slug: 'music', order: 7,
    title: 'Meet a musician', description: 'Reach out.', type: 'single',
    target: null, active: true,
  }]);
  expect(await fetchActiveChallenges()).toEqual([{
    id: 'challenge-stable', trackSlug: 'music', order: 7,
    title: 'Meet a musician', description: 'Reach out.', type: 'single',
    target: null, active: true,
  }]);
  expect(supabase.from).toHaveBeenCalledWith('track_challenges');
  expect(query.eq).toHaveBeenCalledWith('active', true);
});

it('loads live active quotes rather than bundled quote IDs', async () => {
  const query = respondWith([{ id: 'fresh-quote', text: 'Keep going.', author: 'Editor', order: 1, active: true }]);
  expect(await fetchActiveQuotes()).toEqual([{ id: 'fresh-quote', text: 'Keep going.', author: 'Editor', order: 1, active: true }]);
  expect(supabase.from).toHaveBeenCalledWith('quotes');
  expect(query.eq).toHaveBeenCalledWith('active', true);
});
