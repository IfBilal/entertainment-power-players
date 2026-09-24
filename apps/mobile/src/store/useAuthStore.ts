import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabase/client';
import { fetchProfile } from '../services/supabase/profile';

export type AuthStatus = 'loading' | 'signedOut' | 'signedIn';

type AuthState = {
  status: AuthStatus;
  userId: string | null;
  /** null = not loaded yet; [] = loaded, no tracks picked (needs TrackPicker) */
  selectedTrackSlugs: string[] | null;
  /** From the profile row; used to greet the user by name on Home. */
  displayName: string | null;
  photoUrl: string | null;
  hydrated: boolean;
  hydrate: () => () => void;
  setSelectedTrackSlugs: (slugs: string[]) => void;
  reset: () => void;
};

async function loadProfileInto(set: (partial: Partial<AuthState>) => void, session: Session) {
  try {
    const profile = await fetchProfile(session.user.id);
    set({
      selectedTrackSlugs: profile?.selectedTracks ?? [],
      displayName: profile?.displayName ?? null,
      photoUrl: profile?.photoUrl ?? null,
    });
  } catch {
    // Profile row is created by a DB trigger on signup; a transient fetch
    // failure shouldn't block the user out of the app -- treat as "no
    // tracks yet" and let them proceed to TrackPicker, which will retry
    // the write when they continue.
    set({ selectedTrackSlugs: [] });
  }
}

const HYDRATE_TIMEOUT_MS = 5000;

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  userId: null,
  selectedTrackSlugs: null,
  displayName: null,
  photoUrl: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return () => undefined;
    set({ hydrated: true });

    // A rejected promise is not the only way this can go wrong -- a request
    // that never resolves *or* rejects (a silently dropped connection, a
    // flaky captive-portal-style network, some storage adapters on first
    // read) leaves status stuck at 'loading' forever just the same, and a
    // .catch() alone does nothing for that case. Race against a hard
    // timeout so the splash screen always moves on within a few seconds
    // regardless of what's actually stalling underneath. Confirmed live:
    // reported stuck on the splash screen after a restart, even after the
    // .catch()-only fix.
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      console.warn('[auth] getSession timed out after', HYDRATE_TIMEOUT_MS, 'ms, falling back to signedOut');
      set({ status: 'signedOut', userId: null, selectedTrackSlugs: null, displayName: null, photoUrl: null });
    }, HYDRATE_TIMEOUT_MS);

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        const session = data.session;
        if (session) {
          set({ status: 'signedIn', userId: session.user.id });
          loadProfileInto(set, session);
        } else {
          set({ status: 'signedOut', userId: null, selectedTrackSlugs: null, displayName: null, photoUrl: null });
        }
      })
      .catch((error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        // A network failure here (unreachable Supabase, DNS, offline) must
        // not leave status stuck at 'loading' forever -- that strands the
        // user on the splash screen with no way forward. Fail safe to
        // signedOut so they at least reach Onboarding/Login and can retry.
        console.warn('[auth] getSession failed, falling back to signedOut:', error);
        set({ status: 'signedOut', userId: null, selectedTrackSlugs: null, displayName: null, photoUrl: null });
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ status: 'signedIn', userId: session.user.id });
        loadProfileInto(set, session);
      } else {
        set({ status: 'signedOut', userId: null, selectedTrackSlugs: null, displayName: null, photoUrl: null });
      }
    });

    return () => subscription.subscription.unsubscribe();
  },

  setSelectedTrackSlugs: (slugs) => set({ selectedTrackSlugs: slugs }),

  reset: () => set({ status: 'signedOut', userId: null, selectedTrackSlugs: null, displayName: null, photoUrl: null }),
}));
