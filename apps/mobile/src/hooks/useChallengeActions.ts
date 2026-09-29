import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useChallengeProgress } from './useChallengeProgress';
import { challengeProgressQueryKey, saveChallengeProgress } from '../services/supabase/challenges';
import { applyChallengeAction, challengeKey, type Challenge, type ChallengeProgress, type ChallengeProgressMap } from '../services/mock/challenges';

export function useChallengeActions(trackSlug: string, challenge: Challenge) {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const progressQuery = useChallengeProgress();
  const key = challengeKey(trackSlug, challenge.order);
  const progress = progressQuery.data?.[key];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const queuedCount = useRef(0);
  const disabled = !userId || progressQuery.isPending || progressQuery.isError || saving;

  function enqueue(buildNext: (current: ChallengeProgress | undefined) => ChallengeProgress) {
    if (!userId || progressQuery.isPending || progressQuery.isError) return;
    queuedCount.current += 1;
    setSaving(true);
    const job = queue.current.then(async () => {
      if (useAuthStore.getState().userId !== userId) return;
      const current = queryClient.getQueryData<ChallengeProgressMap>(challengeProgressQueryKey(userId))?.[key];
      const next = buildNext(current);
      const saved = await saveChallengeProgress(userId, trackSlug, challenge.order, next);
      queryClient.setQueryData<ChallengeProgressMap>(challengeProgressQueryKey(userId), (previous) => ({ ...previous, [key]: saved }));
      setError(false);
    }).catch(() => setError(true)).finally(() => {
      queuedCount.current -= 1;
      if (queuedCount.current === 0) setSaving(false);
    });
    queue.current = job;
  }

  function act(action: 'toggle' | 'increment' | 'decrement', noteOverride?: string) {
    enqueue((current) => {
      const next = applyChallengeAction(challenge, current, action);
      if (noteOverride !== undefined) next.note = noteOverride;
      return next;
    });
  }

  function saveNote(note: string) {
    enqueue((current) => ({ status: current?.status ?? 'not_started', count: current?.count ?? 0, note, completedAt: current?.completedAt }));
  }

  function complete(noteOverride?: string) {
    enqueue((current) => ({
      status: 'complete',
      count: challenge.type === 'counter' ? challenge.target ?? 1 : 1,
      note: noteOverride ?? current?.note,
      completedAt: current?.completedAt,
    }));
  }

  return { progress, progressQuery, disabled, saving, error, act, complete, saveNote };
}
