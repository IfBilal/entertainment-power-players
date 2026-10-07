import { supabase } from './client';

export type QuestionRecord = {
  id: string;
  categorySlug: string;
  challengeGroup: string;
  number: number;
  question: string;
  answer: string;
  why: string;
  powerMove: string;
};

export type QuestionProgressRecord = {
  questionId: string;
  firstOpenedAt: string | null;
  revealedAt: string | null;
  completedAt: string | null;
};

type QuestionRow = {
  id: string;
  category_slug: string;
  challenge_group: string;
  number: number;
  question: string;
  answer: string;
  why: string;
  power_move: string;
};

type ProgressRow = {
  question_id: string;
  first_opened_at: string | null;
  revealed_at: string | null;
  completed_at: string | null;
};

function toQuestion(row: QuestionRow): QuestionRecord {
  return {
    id: row.id,
    categorySlug: row.category_slug,
    challengeGroup: row.challenge_group,
    number: row.number,
    question: row.question,
    answer: row.answer,
    why: row.why,
    powerMove: row.power_move,
  };
}

/**
 * Active questions, ordered the same way the natural key is defined
 * (category, group, number), so group and "n of m" position come straight
 * from this order rather than a second client-side sort.
 */
export async function fetchActiveQuestions(): Promise<QuestionRecord[]> {
  const { data, error } = await supabase.from('questions')
    .select('id, category_slug, challenge_group, number, question, answer, why, power_move')
    .eq('active', true)
    .order('category_slug')
    .order('challenge_group')
    .order('number');
  if (error) throw error;
  return ((data ?? []) as QuestionRow[]).map(toQuestion);
}

export type QuestionProgressMap = Record<string, QuestionProgressRecord>;

export async function fetchQuestionProgress(userId: string): Promise<QuestionProgressMap> {
  const { data, error } = await supabase.from('question_progress')
    .select('question_id, first_opened_at, revealed_at, completed_at')
    .eq('user_id', userId);
  if (error) throw error;
  const map: QuestionProgressMap = {};
  for (const row of (data ?? []) as ProgressRow[]) {
    map[row.question_id] = { questionId: row.question_id, firstOpenedAt: row.first_opened_at, revealedAt: row.revealed_at, completedAt: row.completed_at };
  }
  return map;
}

type ProgressField = 'first_opened_at' | 'revealed_at' | 'completed_at';

/**
 * Sets one progress timestamp the first time it happens, and only then.
 * A plain upsert of the whole row would overwrite a sibling timestamp that
 * was already set (e.g. completing would otherwise un-reveal), so this reads
 * first and writes only the missing column.
 */
async function touchProgress(userId: string, questionId: string, field: ProgressField): Promise<QuestionProgressRecord> {
  const nowIso = new Date().toISOString();
  const { data: existing, error: readError } = await supabase.from('question_progress')
    .select('question_id, first_opened_at, revealed_at, completed_at')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .maybeSingle();
  if (readError) throw readError;

  let row: ProgressRow;
  if (!existing) {
    const { data, error } = await supabase.from('question_progress')
      .insert({ user_id: userId, question_id: questionId, [field]: nowIso })
      .select('question_id, first_opened_at, revealed_at, completed_at')
      .single();
    if (error) throw error;
    row = data as ProgressRow;
  } else if (!existing[field]) {
    const { data, error } = await supabase.from('question_progress')
      .update({ [field]: nowIso })
      .eq('user_id', userId)
      .eq('question_id', questionId)
      .select('question_id, first_opened_at, revealed_at, completed_at')
      .single();
    if (error) throw error;
    row = data as ProgressRow;
  } else {
    row = existing as ProgressRow;
  }
  return { questionId: row.question_id, firstOpenedAt: row.first_opened_at, revealedAt: row.revealed_at, completedAt: row.completed_at };
}

export const markQuestionOpened = (userId: string, questionId: string) => touchProgress(userId, questionId, 'first_opened_at');
export const revealQuestion = (userId: string, questionId: string) => touchProgress(userId, questionId, 'revealed_at');
export const completeQuestion = (userId: string, questionId: string) => touchProgress(userId, questionId, 'completed_at');
