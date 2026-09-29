import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useChallengeProgress } from './useChallengeProgress';
import { activityQueryKey } from '../services/supabase/activity';
import { challengeProgressQueryKey, transitionChallenge } from '../services/supabase/challenges';
import { legacyChallengeKey, type ChallengeProgressMap } from '../utils/challengeProgress';
import { computeWeekKey } from '../utils/weekKey';
import type { ChallengeRecord } from '../types/week3';

export function useChallengeActions(challenge: ChallengeRecord) {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const progressQuery = useChallengeProgress();
  const legacyKey = legacyChallengeKey(challenge.trackSlug, challenge.order);
  const progress = progressQuery.data?.[challenge.id] ?? progressQuery.data?.[legacyKey];
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const queuedCount = useRef(0);
  const disabled = !userId || progressQuery.isPending || progressQuery.isError || saving;

  function enqueue(action: 'toggle' | 'increment' | 'decrement' | 'note', note?: string, onlyIfIncomplete = false) {
    if (!userId || progressQuery.isPending || progressQuery.isError) return;
    queuedCount.current += 1;
    setSaving(true);
    const job = queue.current.then(async () => {
      if (useAuthStore.getState().userId !== userId) return;
      const currentMap = queryClient.getQueryData<ChallengeProgressMap>(challengeProgressQueryKey(userId));
      const current = currentMap?.[challenge.id] ?? currentMap?.[legacyKey];
      if (onlyIfIncomplete && current?.status === 'complete') return;
      const saved = await transitionChallenge(challenge, action, note ?? current?.note, computeWeekKey(new Date()));
      queryClient.setQueryData<ChallengeProgressMap>(challengeProgressQueryKey(userId), (previous) => ({
        ...previous,
        [challenge.id]: saved,
        [legacyKey]: saved,
      }));
      await queryClient.invalidateQueries({ queryKey: activityQueryKey(userId) });
      setError(false);
    }).catch(() => setError(true)).finally(() => {
      queuedCount.current -= 1;
      if (queuedCount.current === 0) setSaving(false);
    });
    queue.current = job;
  }

  function act(action: 'toggle' | 'increment' | 'decrement', noteOverride?: string) {
    enqueue(action, noteOverride);
  }

  function saveNote(note: string) {
    enqueue('note', note);
  }

  function complete(noteOverride?: string) {
    if (challenge.type === 'single') enqueue('toggle', noteOverride, true);
  }

  return { progress, progressQuery, disabled, saving, error, act, complete, saveNote };
}
