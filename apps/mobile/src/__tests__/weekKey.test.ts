import { computeWeekKey } from '../utils/weekKey';

describe('computeWeekKey', () => {
  it('matches the handbook example format', () => {
    expect(computeWeekKey(new Date(2026, 8, 11))).toMatch(/^\d{4}-W\d{2}$/);
  });

  it('gives the same key for every day within one Mon-Sun week', () => {
    // 2026-09-07 is a Monday, 2026-09-13 is the following Sunday.
    const monday = computeWeekKey(new Date(2026, 8, 7));
    const sunday = computeWeekKey(new Date(2026, 8, 13));
    expect(monday).toBe(sunday);
  });

  it('rolls over to a new week at local midnight on the boundary', () => {
    // Sunday 2026-09-13 23:59 vs Monday 2026-09-14 00:01 (local time) — the QA
    // checklist explicitly calls out this boundary (handbook §7).
    const justBeforeMidnight = new Date(2026, 8, 13, 23, 59);
    const justAfterMidnight = new Date(2026, 8, 14, 0, 1);
    expect(computeWeekKey(justBeforeMidnight)).not.toBe(computeWeekKey(justAfterMidnight));
  });

  it('handles the ISO year boundary around Jan 1', () => {
    // Jan 1 2027 is a Friday, so it belongs to ISO week 53 of 2026, not week 1 of 2027.
    expect(computeWeekKey(new Date(2027, 0, 1))).toBe('2026-W53');
  });
});
