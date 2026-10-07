import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import {
  completeQuestion,
  fetchActiveQuestions,
  fetchQuestionProgress,
  markQuestionOpened,
  revealQuestion,
  type QuestionProgressMap,
  type QuestionProgressRecord,
} from '../services/supabase/questions';

const questionsQueryKey = ['questions'] as const;
const questionProgressQueryKey = (userId: string) => ['questionProgress', userId] as const;

export function useQuestions() {
  const isPro = useAppStore((state) => state.isPro);
  return useQuery({
    queryKey: questionsQueryKey,
    queryFn: fetchActiveQuestions,
    enabled: isPro,
  });
}

export function useQuestionProgress() {
  const userId = useAuthStore((state) => state.userId);
  return useQuery({
    queryKey: userId ? questionProgressQueryKey(userId) : ['questionProgress', 'signed-out'],
    queryFn: () => fetchQuestionProgress(userId!),
    enabled: Boolean(userId),
  });
}

/** Reveal/complete actions for one question, with an optimistic progress-map update. */
export function useQuestionActions(questionId: string) {
  const userId = useAuthStore((state) => state.userId);
  const queryClient = useQueryClient();
  const [error, setError] = useState(false);

  function apply(mutator: (userId: string, questionId: string) => Promise<QuestionProgressRecord>) {
    if (!userId) return;
    setError(false);
    mutator(userId, questionId)
      .then((saved) => {
        queryClient.setQueryData<QuestionProgressMap>(questionProgressQueryKey(userId), (previous) => ({
          ...previous,
          [questionId]: saved,
        }));
      })
      .catch(() => setError(true));
  }

  return {
    error,
    open: () => apply(markQuestionOpened),
    reveal: () => apply(revealQuestion),
    complete: () => apply(completeQuestion),
  };
}
