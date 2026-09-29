import { useQuery } from '@tanstack/react-query';
import { fetchActiveChallenges, fetchActiveQuotes, fetchActiveTracks } from '../services/supabase/content';
import { useAppStore } from '../store/useAppStore';
import { week3QueryKeys } from '../types/week3';

// Content is admin-editable at runtime. Polling while visible gives an
// independent freshness path even when Realtime publication is unavailable.
const CONTENT_REFRESH_MS = process.env.NODE_ENV === 'test' ? false : 10_000;

export function useTracks() {
  return useQuery({
    queryKey: week3QueryKeys.tracks,
    queryFn: fetchActiveTracks,
    refetchInterval: CONTENT_REFRESH_MS,
    refetchOnMount: 'always',
  });
}

export function useChallenges() {
  const isPro = useAppStore((state) => state.isPro);
  return useQuery({
    queryKey: ['challenges', 'active'] as const,
    queryFn: fetchActiveChallenges,
    enabled: isPro,
    refetchInterval: isPro ? CONTENT_REFRESH_MS : false,
    refetchOnMount: 'always',
  });
}

export function useQuotes() {
  return useQuery({
    queryKey: week3QueryKeys.quotes,
    queryFn: fetchActiveQuotes,
    refetchInterval: CONTENT_REFRESH_MS,
    refetchOnMount: 'always',
  });
}
