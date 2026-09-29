import { supabase } from './client';
import type { ActivityEntry, ActivityType } from '../mock/tracker';

type ActivityRow = {
  id: string;
  type: ActivityType;
  title: string;
  contact_id: string | null;
  date: string;
  week_key: string;
  notes: string | null;
};

function toActivityEntry(row: ActivityRow): ActivityEntry {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    contactId: row.contact_id ?? undefined,
    date: row.date,
    weekKey: row.week_key,
    notes: row.notes ?? undefined,
  };
}

const ACTIVITY_COLUMNS = 'id, type, title, contact_id, date, week_key, notes';

export function activityQueryKey(userId: string | null) {
  return ['activity', userId] as const;
}

export async function fetchUserActivity(userId: string): Promise<ActivityEntry[]> {
  const { data, error } = await supabase
    .from('activity')
    .select(ACTIVITY_COLUMNS)
    .eq('user_id', userId)
    .order('date', { ascending: false });
  if (error) throw error;
  return ((data ?? []) as ActivityRow[]).map(toActivityEntry);
}

export async function createActivity(params: {
  userId: string;
  type: ActivityType;
  title: string;
  contactId?: string;
  date: Date;
  weekKey: string;
  notes?: string;
}): Promise<ActivityEntry> {
  const { data, error } = await supabase.from('activity').insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    contact_id: params.contactId ?? null,
    date: params.date.toISOString(),
    week_key: params.weekKey,
    notes: params.notes ?? null,
  }).select(ACTIVITY_COLUMNS).single();
  if (error) throw error;
  return toActivityEntry(data as ActivityRow);
}

export async function deleteActivity(userId: string, activityId: string): Promise<void> {
  const { error } = await supabase.from('activity').delete().eq('user_id', userId).eq('id', activityId);
  if (error) throw error;
}
