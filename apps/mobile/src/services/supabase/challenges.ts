import { supabase } from './client';
import { legacyChallengeKey, type ChallengeProgress, type ChallengeProgressMap } from '../../utils/challengeProgress';
import type { ChallengeRecord } from '../../types/week3';

export function challengeProgressQueryKey(userId: string | null) {
  return ['challengeProgress', userId] as const;
}

export async function fetchChallengeProgress(userId: string): Promise<ChallengeProgressMap> {
  const { data, error } = await supabase.from('challenge_progress')
    .select('challenge_id, track_slug, challenge_order, status, count, note, completed_at')
    .eq('user_id', userId);
  if (error) throw error;
  const progress: ChallengeProgressMap = {};
  for (const row of data ?? []) {
    const entry = {
      status: row.status as ChallengeProgress['status'],
      count: row.count,
      note: row.note ?? undefined,
      completedAt: row.completed_at ?? undefined,
    };
    progress[legacyChallengeKey(row.track_slug, row.challenge_order)] = entry;
    if (row.challenge_id) progress[row.challenge_id] = entry;
  }
  return progress;
}

/** One server transaction changes progress and its linked tracker activity. */
export async function transitionChallenge(
  challenge: ChallengeRecord,
  action: 'toggle' | 'increment' | 'decrement' | 'note',
  note: string | undefined,
  weekKey: string,
): Promise<ChallengeProgress> {
  const { data, error } = await supabase.rpc('transition_challenge', {
    p_challenge_id: challenge.id,
    p_action: action,
    p_note: note ?? null,
    p_week_key: weekKey,
  });
  if (error) throw error;
  if (!data) throw new Error('Challenge update did not return progress.');
  return {
    status: data.status as ChallengeProgress['status'],
    count: data.count,
    note: data.note ?? undefined,
    completedAt: data.completed_at ?? undefined,
  };
}
