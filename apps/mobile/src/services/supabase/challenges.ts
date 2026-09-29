import { supabase } from './client';
import { challengeKey, type ChallengeProgress, type ChallengeProgressMap } from '../mock/challenges';
import { tracks } from '../mock/challenges';
import type { ActivityEntry } from '../mock/tracker';
import { computeWeekKey } from '../../utils/weekKey';

export function challengeProgressQueryKey(userId: string | null) {
  return ['challengeProgress', userId] as const;
}

export async function fetchChallengeProgress(userId: string): Promise<ChallengeProgressMap> {
  const { data, error } = await supabase.from('challenge_progress')
    .select('track_slug, challenge_order, status, count, note, completed_at')
    .eq('user_id', userId);
  if (error) throw error;
  const progress: ChallengeProgressMap = {};
  for (const row of data ?? []) {
    progress[challengeKey(row.track_slug, row.challenge_order)] = {
      status: row.status as ChallengeProgress['status'],
      count: row.count,
      note: row.note ?? undefined,
      completedAt: row.completed_at ?? undefined,
    };
  }
  return progress;
}

export async function saveChallengeProgress(userId: string, trackSlug: string, challengeOrder: number, next: ChallengeProgress): Promise<ChallengeProgress> {
  const completedAt = next.status === 'complete' ? next.completedAt ?? new Date().toISOString() : undefined;
  const { error } = await supabase.from('challenge_progress').upsert({
    user_id: userId,
    track_slug: trackSlug,
    challenge_order: challengeOrder,
    status: next.status,
    count: next.count,
    note: next.note ?? null,
    completed_at: completedAt ?? null,
  }, { onConflict: 'user_id,track_slug,challenge_order' }).select('challenge_order').single();
  if (error) throw error;
  return { ...next, completedAt };
}

export function completedChallengeEntries(progress: ChallengeProgressMap): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  for (const track of tracks) {
    for (const challenge of track.challenges) {
      const key = challengeKey(track.slug, challenge.order);
      const saved = progress[key];
      if (saved?.status !== 'complete' || !saved.completedAt) continue;
      entries.push({
        id: `challenge_${key}`,
        type: 'challenge',
        title: `Completed "${challenge.title}"`,
        date: saved.completedAt,
        weekKey: computeWeekKey(new Date(saved.completedAt)),
        notes: saved.note,
      });
    }
  }
  return entries;
}
