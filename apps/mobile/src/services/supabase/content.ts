import { supabase } from './client';
import type { ChallengeRecord, DailyQuoteRecord, QuoteRecord, TrackRecord } from '../../types/week3';

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

/** The device's IANA timezone, e.g. "America/New_York". Falls back to UTC if unavailable. */
export function getDeviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

type DailyQuoteRow = { assigned_quote_id: string; assigned_text: string; assigned_author: string; assigned_local_date: string };

/**
 * The member's featured quote for their current local day (plan §7.3): the
 * server picks and persists it, excluding the member's own last 224 local
 * days, so it never repeats within that window and never changes on refresh
 * or reinstall. The device timezone travels with every call, which is what
 * makes day boundaries correct after travel without a separate sync step.
 */
export async function fetchDailyQuote(): Promise<DailyQuoteRecord> {
  const { data, error } = await supabase.rpc('get_daily_quote', { p_timezone: getDeviceTimeZone() });
  if (error) throw error;
  const row = (data as DailyQuoteRow[] | null)?.[0];
  if (!row) throw new Error('No quote was assigned.');
  return { quoteId: row.assigned_quote_id, text: row.assigned_text, author: row.assigned_author, localDate: row.assigned_local_date };
}

/**
 * Best-effort: keeps `profiles.timezone` current so admin tooling and future
 * server jobs can see where a member last was. The daily quote itself never
 * depends on this write succeeding -- it always receives the device
 * timezone directly.
 */
export async function syncProfileTimezone(userId: string): Promise<void> {
  try {
    await supabase.from('profiles').update({ timezone: getDeviceTimeZone() }).eq('id', userId);
  } catch {
    // Non-critical; the next call will try again.
  }
}
