import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { fetchActiveChallenges, fetchActiveQuotes, fetchActiveTracks, fetchDailyQuote, syncProfileTimezone } from '../services/supabase/content';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
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

/** The server-assigned featured quote for the signed-in member's current local day. */
export function useDailyQuote() {
  const userId = useAuthStore((state) => state.userId);
  return useQuery({
    queryKey: userId ? week3QueryKeys.dailyQuote(userId) : ['dailyQuote', 'signed-out'],
    queryFn: async () => {
      if (userId) void syncProfileTimezone(userId);
      return fetchDailyQuote();
    },
    enabled: Boolean(userId) && !isIsolatedPreview,
    // A fresh check costs one cheap select after the day's row exists; this
    // is what catches a local-midnight rollover while the app stays open.
    refetchInterval: isIsolatedPreview ? false : CONTENT_REFRESH_MS,
    refetchOnMount: isIsolatedPreview ? false : 'always',
  });
}
