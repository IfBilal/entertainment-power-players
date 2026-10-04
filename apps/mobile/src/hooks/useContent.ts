import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { fetchActiveChallenges, fetchActiveQuotes, fetchActiveTracks } from '../services/supabase/content';
import { useAppStore } from '../store/useAppStore';
import { week3QueryKeys } from '../types/week3';

// Content is admin-editable at runtime. Polling while visible gives an
// independent freshness path even when Realtime publication is unavailable.
const CONTENT_REFRESH_MS = process.env.NODE_ENV === 'test' ? false : 10_000;
const isIsolatedPreview = __DEV__ && Platform.OS === 'web' && Boolean(new URLSearchParams(globalThis.location?.search ?? '').get('preview'));

export function useTracks() {
  return useQuery({
    queryKey: week3QueryKeys.tracks,
    queryFn: fetchActiveTracks,
    refetchInterval: isIsolatedPreview ? false : CONTENT_REFRESH_MS,
    refetchOnMount: isIsolatedPreview ? false : 'always',
  });
}

export function useChallenges() {
  const isPro = useAppStore((state) => state.isPro);
  return useQuery({
    queryKey: ['challenges', 'active'] as const,
    queryFn: fetchActiveChallenges,
    enabled: isPro,
    refetchInterval: isPro && !isIsolatedPreview ? CONTENT_REFRESH_MS : false,
    refetchOnMount: isIsolatedPreview ? false : 'always',
  });
}

export function useQuotes() {
  return useQuery({
    queryKey: week3QueryKeys.quotes,
    queryFn: fetchActiveQuotes,
    refetchInterval: isIsolatedPreview ? false : CONTENT_REFRESH_MS,
    refetchOnMount: isIsolatedPreview ? false : 'always',
  });
}
