import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type AdminAuthState = {
  status: 'loading' | 'signedOut' | 'notAdmin' | 'admin';
  session: Session | null;
  email: string | null;
};

/**
 * Handbook §5: "Access requires the `admin` claim; anyone else is bounced to
 * a plain 'no access' screen." On Supabase that claim is the
 * `profile_entitlements.is_admin` row, which RLS lets a user read only for
 * themselves — so this check can't be spoofed client-side into granting
 * access to data, since every admin write is independently gated by RLS.
 * This just decides what UI to show.
 */
export function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({ status: 'loading', session: null, email: null });

  useEffect(() => {
    let active = true;

    async function resolve(session: Session | null) {
      if (!active) return;
      if (!session) {
        setState({ status: 'signedOut', session: null, email: null });
        return;
      }

      const { data, error } = await supabase
        .from('profile_entitlements')
        .select('is_admin')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (!active) return;
      setState({
        status: !error && data?.is_admin ? 'admin' : 'notAdmin',
        session,
        email: session.user.email ?? null,
      });
    }

    supabase.auth.getSession().then(({ data }) => resolve(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      resolve(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
