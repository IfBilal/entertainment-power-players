import { create } from 'zustand';
import { computeWeekKey } from '../utils/weekKey';
import { defaultGoals, mockActivity, type ActivityEntry, type WeeklyGoals } from '../services/mock/tracker';

type TrackerState = {
  entries: ActivityEntry[];
  goals: Record<string, WeeklyGoals>; // keyed by weekKey, carried forward if absent
  addEntry: (entry: Omit<ActivityEntry, 'id' | 'weekKey' | 'date'> & { date: Date }) => void;
  removeEntry: (id: string) => void;
  goalsForWeek: (weekKey: string) => WeeklyGoals;
  setGoalsForWeek: (weekKey: string, goals: WeeklyGoals) => void;
};

export const useTrackerStore = create<TrackerState>((set, get) => ({
  entries: mockActivity,
  goals: {},
  addEntry: (entry) => {
    const weekKey = computeWeekKey(entry.date);
    const newEntry: ActivityEntry = {
      id: `activity_${Date.now()}`,
      type: entry.type,
      title: entry.title,
      contactId: entry.contactId,
      notes: entry.notes,
      date: entry.date.toISOString(),
      weekKey,
    };
    set({ entries: [newEntry, ...get().entries] });
  },
  removeEntry: (id) => set({ entries: get().entries.filter((e) => e.id !== id) }),
  goalsForWeek: (weekKey) => get().goals[weekKey] ?? defaultGoals,
  setGoalsForWeek: (weekKey, goals) => set({ goals: { ...get().goals, [weekKey]: goals } }),
}));
