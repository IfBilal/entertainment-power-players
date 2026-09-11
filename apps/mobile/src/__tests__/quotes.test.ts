import { quoteOfTheDay, type Quote } from '../services/mock/quotes';

const quotes: Quote[] = [
  { id: 'q1', text: 'A', author: 'x', active: true, order: 1 },
  { id: 'q2', text: 'B', author: 'y', active: true, order: 2 },
  { id: 'q3', text: 'C (inactive)', author: 'z', active: false, order: 3 },
];

describe('quoteOfTheDay', () => {
  it('is deterministic for the same calendar day', () => {
    const morning = new Date(2026, 8, 11, 6, 0);
    const evening = new Date(2026, 8, 11, 23, 0);
    expect(quoteOfTheDay(quotes, morning)?.id).toBe(quoteOfTheDay(quotes, evening)?.id);
  });

  it('only ever picks an active quote', () => {
    for (let day = 1; day <= 28; day += 1) {
      const pick = quoteOfTheDay(quotes, new Date(2026, 0, day));
      expect(pick?.active).toBe(true);
    }
  });

  it('returns null when there are no active quotes', () => {
    expect(quoteOfTheDay(quotes.map((q) => ({ ...q, active: false })), new Date())).toBeNull();
  });

  it('changes at local midnight (different days can pick different quotes)', () => {
    const picks = new Set<string>();
    for (let day = 1; day <= 28; day += 1) {
      const pick = quoteOfTheDay(quotes, new Date(2026, 0, day));
      if (pick) picks.add(pick.id);
    }
    // With 2 active quotes and 28 distinct days, both should show up at least once.
    expect(picks.size).toBeGreaterThan(1);
  });
});
