import { countsForWeek, last8WeeksTotals, type ActivityEntry } from '../services/mock/tracker';
import { goalsForWeek } from '../services/supabase/goals';
import { computeWeekKey } from '../utils/weekKey';

it('keeps eight consecutive weeks, including empty weeks and the ISO year rollover', () => {
  const end = new Date(2027, 0, 4, 12);
  const entries: ActivityEntry[] = [
    { id: 'challenge-1', type: 'challenge', title: 'Completed', date: new Date(2026, 11, 28).toISOString(), weekKey: '2026-W53' },
    { id: 'event-1', type: 'event', title: 'Mixer', date: end.toISOString(), weekKey: '2027-W01' },
  ];
  const weeks = last8WeeksTotals(entries, end);
  expect(weeks).toHaveLength(8);
  expect(weeks.at(-2)).toEqual({ weekKey: '2026-W53', total: 1 });
  expect(weeks.at(-1)).toEqual({ weekKey: '2027-W01', total: 1 });
  expect(weeks.filter((week) => week.total === 0)).toHaveLength(6);
});

it('does not treat a saved zero goal as missing or rewrite an earlier week', () => {
  const goals = {
    '2026-W52': { contacts: 3, events: 2, followUps: 1 },
    '2026-W53': { contacts: 0, events: 0, followUps: 0 },
  };
  expect(goalsForWeek(goals, '2026-W52')).toEqual(goals['2026-W52']);
  expect(goalsForWeek(goals, '2027-W01')).toEqual(goals['2026-W53']);
});

it('counts actual activity beyond the goal and uses the persisted week key', () => {
  const weekKey = computeWeekKey(new Date(2026, 8, 28, 12));
  const entries: ActivityEntry[] = [1, 2, 3].map((n) => ({ id: String(n), type: 'contact', title: `Contact ${n}`, date: new Date(2026, 8, 28).toISOString(), weekKey }));
  expect(countsForWeek(entries, weekKey).contacts).toBe(3);
  expect(countsForWeek(entries, '2026-W39').contacts).toBe(0);
});
