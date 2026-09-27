import * as Linking from 'expo-linking';
import type { EmailOtpType, Session } from '@supabase/supabase-js';
import { supabase } from './client';

export const APP_AUTH_SCHEME = 'com.entertainmentpowerplayers.app';
export const AUTH_CALLBACK_PATH = 'auth/callback';

export type AuthRedirectKind = 'signup' | 'recovery' | 'email-change' | 'verification';

/**
 * Returns an app callback URL for the current runtime. In an installed app it
 * uses the registered app scheme; in Expo Go Linking generates the current
 * exp:// URL, which is why the Supabase redirect allowlist needs both forms.
 */
export function getAuthRedirectUrl() {
  return Linking.createURL(AUTH_CALLBACK_PATH, { scheme: APP_AUTH_SCHEME });
}

function getCallbackParams(url: URL) {
  const query = new URLSearchParams(url.search);
  const fragment = new URLSearchParams(url.hash.replace(/^#/, ''));
  return {
    get(name: string) {
      return query.get(name) ?? fragment.get(name);
    },
  };
}

export function isAuthCallbackUrl(value: string) {
  try {
    const url = new URL(value);
    const scheme = url.protocol.slice(0, -1);
    if (scheme !== APP_AUTH_SCHEME && scheme !== 'exp' && scheme !== 'exps') return false;

    // `powerplayers://auth/callback` parses as host=auth + path=/callback,
    // while Expo Go uses exp://host/--/auth/callback.
    const location = `${url.hostname}${url.pathname}`;
    const route = location.split('/--/').at(-1)?.replace(/^\/+|\/+$/g, '');
    return route === AUTH_CALLBACK_PATH;
  } catch {
    return false;
  }
}

function redirectKind(type: string | null): AuthRedirectKind {
  if (type === 'recovery') return 'recovery';
  if (type === 'email_change' || type === 'email') return 'email-change';
  if (type === 'signup' || type === 'invite') return 'signup';
  return 'verification';
}

const OTP_TYPES = new Set<EmailOtpType>([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

/** Complete Supabase's email link in the native app without logging token URLs. */
export async function completeAuthRedirect(value: string): Promise<{
  kind: AuthRedirectKind;
  session: Session | null;
}> {
  if (!isAuthCallbackUrl(value)) throw new Error('This is not an app auth callback.');

  const url = new URL(value);
  const params = getCallbackParams(url);
  const errorDescription = params.get('error_description') ?? params.get('error');
  if (errorDescription) throw new Error(errorDescription);

  const kind = redirectKind(params.get('type'));
  const code = params.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return { kind, session: data.session };
  }

  const tokenHash = params.get('token_hash');
  const otpType = params.get('type');
  if (tokenHash && otpType && OTP_TYPES.has(otpType as EmailOtpType)) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as EmailOtpType,
    });
    if (error) throw error;
    return { kind, session: data.session };
  }

  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw error;
    return { kind, session: data.session };
  }

  throw new Error('The confirmation link is incomplete or has expired. Request a new email and try again.');
}
