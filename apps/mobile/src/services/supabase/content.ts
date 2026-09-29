import { supabase } from './client';
import type { ChallengeRecord, QuoteRecord, TrackRecord } from '../../types/week3';

type TrackRow = { slug: string; name: string; order: number; active: boolean };
type ChallengeRow = {
  id: string;
  track_slug: string;
  order: number;
  title: string;
  description: string;
  type: 'single' | 'counter';
  target: number | null;
  active: boolean;
};
type QuoteRow = { id: string; text: string; author: string; order: number; active: boolean };

export async function fetchActiveTracks(): Promise<TrackRecord[]> {
  const { data, error } = await supabase.from('tracks')
    .select('slug, name, order, active')
    .eq('active', true)
    .order('order')
    .order('slug');
  if (error) throw error;
  return ((data ?? []) as TrackRow[]).map((row) => ({ ...row }));
}

export async function fetchActiveChallenges(): Promise<ChallengeRecord[]> {
  const { data, error } = await supabase.from('track_challenges')
    .select('id, track_slug, order, title, description, type, target, active')
    .eq('active', true)
    .order('track_slug')
    .order('order');
  if (error) throw error;
  return ((data ?? []) as ChallengeRow[]).map((row) => ({
    id: row.id,
    trackSlug: row.track_slug,
    order: row.order,
    title: row.title,
    description: row.description,
    type: row.type,
    target: row.target,
    active: row.active,
  }));
}

export async function fetchActiveQuotes(): Promise<QuoteRecord[]> {
  const { data, error } = await supabase.from('quotes')
    .select('id, text, author, order, active')
    .eq('active', true)
    .order('order')
    .order('id');
  if (error) throw error;
  return ((data ?? []) as QuoteRow[]).map((row) => ({ ...row }));
}
