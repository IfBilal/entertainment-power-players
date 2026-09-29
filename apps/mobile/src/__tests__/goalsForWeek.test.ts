import { goalsForWeek } from '../services/supabase/goals';
import { defaultGoals } from '../services/mock/tracker';

it('uses the most recent saved goals, never a future week', () => {
  const goals = {
    '2025-W52': { contacts: 7, events: 1, followUps: 0 },
    '2026-W02': { contacts: 0, events: 2, followUps: 3 },
  };
  expect(goalsForWeek(goals, '2025-W51')).toEqual(defaultGoals);
  expect(goalsForWeek(goals, '2026-W01')).toEqual(goals['2025-W52']);
  expect(goalsForWeek(goals, '2026-W03')).toEqual(goals['2026-W02']);
});
