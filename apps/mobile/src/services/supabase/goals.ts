import { supabase } from './client';
import { defaultGoals, type WeeklyGoals } from '../mock/tracker';

export type GoalsByWeek = Record<string, WeeklyGoals>;

export function goalsQueryKey(userId: string | null) {
  return ['goals', userId] as const;
}

export function goalsForWeek(goals: GoalsByWeek, weekKey: string): WeeklyGoals {
  const latestWeek = Object.keys(goals).filter((key) => key <= weekKey).sort().at(-1);
  return latestWeek ? goals[latestWeek] : defaultGoals;
}

export async function fetchUserGoals(userId: string): Promise<GoalsByWeek> {
  const { data, error } = await supabase.from('goals')
    .select('week_key, contacts, events, follow_ups')
    .eq('user_id', userId);
  if (error) throw error;
  const goals: GoalsByWeek = {};
  for (const row of data ?? []) {
    goals[row.week_key] = { contacts: row.contacts, events: row.events, followUps: row.follow_ups };
  }
  return goals;
}

export async function saveWeeklyGoals(userId: string, weekKey: string, goals: WeeklyGoals): Promise<void> {
  const { error } = await supabase.from('goals')
    .upsert({
      user_id: userId,
      week_key: weekKey,
      contacts: goals.contacts,
      events: goals.events,
      follow_ups: goals.followUps,
    }, { onConflict: 'user_id,week_key' })
    .select('week_key')
    .single();
  if (error) throw error;
}
