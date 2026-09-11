export type Quote = {
  id: string;
  text: string;
  author: string;
  active: boolean;
  order: number;
};

export const mockQuotes: Quote[] = [
  { id: 'quote_1', text: 'Opportunities don’t happen. You create them.', author: 'Chris Grosser', active: true, order: 1 },
  { id: 'quote_2', text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', active: true, order: 2 },
  { id: 'quote_3', text: 'Success is where preparation and opportunity meet.', author: 'Bobby Unser', active: true, order: 3 },
  { id: 'quote_4', text: 'Your network is your net worth.', author: 'Porter Gale', active: true, order: 4 },
  { id: 'quote_5', text: 'Do the best you can until you know better. Then when you know better, do better.', author: 'Maya Angelou', active: true, order: 5 },
];

/**
 * Deterministic "quote of the day": every user on the same local calendar day
 * sees the same quote (handbook §4.5), changing at local midnight. Picks from
 * only the active quotes, ordered stably by `order`.
 */
export function quoteOfTheDay(quotes: Quote[], date: Date): Quote | null {
  const active = quotes.filter((q) => q.active).sort((a, b) => a.order - b.order);
  if (active.length === 0) return null;

  const dayKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let i = 0; i < dayKey.length; i += 1) {
    hash = (hash * 31 + dayKey.charCodeAt(i)) >>> 0;
  }
  return active[hash % active.length];
}
