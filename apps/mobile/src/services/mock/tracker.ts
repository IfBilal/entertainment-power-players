import { computeWeekKey } from '../../utils/weekKey';

export type ActivityType = 'contact' | 'event' | 'followUp' | 'challenge';

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  title: string;
  contactId?: string;
  date: string; // ISO date string
  weekKey: string;
  notes?: string;
};

export type WeeklyGoals = {
  contacts: number;
  events: number;
  followUps: number;
};

export const defaultGoals: WeeklyGoals = { contacts: 5, events: 2, followUps: 3 };

export function countsForWeek(entries: ActivityEntry[], weekKey: string): { contacts: number; events: number; followUps: number } {
  const inWeek = entries.filter((e) => e.weekKey === weekKey);
  return {
    contacts: inWeek.filter((e) => e.type === 'contact').length,
    events: inWeek.filter((e) => e.type === 'event').length,
    followUps: inWeek.filter((e) => e.type === 'followUp').length,
  };
}

/** Total activity count per week, for the last 8 weeks ending at `endDate`, oldest first. */
export function last8WeeksTotals(entries: ActivityEntry[], endDate: Date): Array<{ weekKey: string; total: number }> {
  const weeks: Array<{ weekKey: string; total: number }> = [];
  for (let i = 7; i >= 0; i -= 1) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i * 7);
    const weekKey = computeWeekKey(d);
    const total = entries.filter((e) => e.weekKey === weekKey).length;
    weeks.push({ weekKey, total });
  }
  return weeks;
}

const now = new Date();
export const mockActivity: ActivityEntry[] = [
  { id: 'activity_1', type: 'contact', title: 'Met Jane Doe', contactId: 'contact_1', date: now.toISOString(), weekKey: computeWeekKey(now) },
  { id: 'activity_2', type: 'event', title: 'Industry mixer', date: now.toISOString(), weekKey: computeWeekKey(now) },
  { id: 'activity_3', type: 'followUp', title: 'Follow up with John Smith', contactId: 'contact_2', date: now.toISOString(), weekKey: computeWeekKey(now) },
];
