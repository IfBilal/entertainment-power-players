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
  hydrated: boolean;
  hydrate: () => () => void;
  setSelectedTrackSlugs: (slugs: string[]) => void;
  reset: () => void;
};

async function loadProfileInto(set: (partial: Partial<AuthState>) => void, session: Session) {
  try {
    const profile = await fetchProfile(session.user.id);
    set({ selectedTrackSlugs: profile?.selectedTracks ?? [] });
  } catch {
    // Profile row is created by a DB trigger on signup; a transient fetch
    // failure shouldn't block the user out of the app -- treat as "no
    // tracks yet" and let them proceed to TrackPicker, which will retry
    // the write when they continue.
    set({ selectedTrackSlugs: [] });
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'loading',
  userId: null,
  selectedTrackSlugs: null,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return () => undefined;
    set({ hydrated: true });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        const session = data.session;
        if (session) {
          set({ status: 'signedIn', userId: session.user.id });
          loadProfileInto(set, session);
        } else {
          set({ status: 'signedOut', userId: null, selectedTrackSlugs: null });
        }
      })
      .catch((error) => {
        // A network failure here (unreachable Supabase, DNS, offline) must
        // not leave status stuck at 'loading' forever -- that strands the
        // user on the splash screen with no way forward. Fail safe to
        // signedOut so they at least reach Onboarding/Login and can retry.
        console.warn('[auth] getSession failed, falling back to signedOut:', error);
        set({ status: 'signedOut', userId: null, selectedTrackSlugs: null });
      });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({ status: 'signedIn', userId: session.user.id });
        loadProfileInto(set, session);
      } else {
        set({ status: 'signedOut', userId: null, selectedTrackSlugs: null });
      }
    });

    return () => subscription.subscription.unsubscribe();
  },

  setSelectedTrackSlugs: (slugs) => set({ selectedTrackSlugs: slugs }),

  reset: () => set({ status: 'signedOut', userId: null, selectedTrackSlugs: null }),
}));
