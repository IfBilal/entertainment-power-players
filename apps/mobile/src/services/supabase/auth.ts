import { supabase } from './client';
import * as WebBrowser from 'expo-web-browser';
import { completeAuthRedirect, getAuthRedirectUrl } from './authRedirect';

/** Thrown by signUpWithEmail when the email already belongs to a confirmed account. */
export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super('An account with this email already exists. Try logging in instead.');
    this.name = 'EmailAlreadyRegisteredError';
  }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  // `full_name` rides along in user_metadata so the name captured at signup
  // isn't discarded -- the profile row is created from it server-side.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getAuthRedirectUrl(),
      ...(fullName ? { data: { full_name: fullName } } : {}),
    },
  });
  if (error) throw error;

  // Supabase deliberately returns a 200 with a synthetic user rather than an
  // error when the email already belongs to a *confirmed* account -- this
  // stops attackers from using the signup endpoint to enumerate registered
  // emails. The documented, enumeration-safe way to detect this case on our
  // own account (not a probe) is an empty `identities` array on the
  // response: a genuinely new signup always has exactly one. Without this
  // check the UI would wrongly say "check your email to confirm" for an
  // account that's already active.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new EmailAlreadyRegisteredError();
  }

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectUrl(),
  });
  if (error) throw error;
}

/** Thrown when the new address already belongs to another account. */
export class EmailInUseError extends Error {
  constructor() {
    super('This email is already in use by another account. Try a different email.');
    this.name = 'EmailInUseError';
  }
}

/** Thrown when the member has used up their email checks for the hour. */
export class EmailCheckRateLimitedError extends Error {
  constructor() {
    super('Too many email checks. Please wait an hour and try again.');
    this.name = 'EmailCheckRateLimitedError';
  }
}

/**
 * Asks the server whether `email` is free. Throws EmailInUseError when another
 * account already uses it, so the caller never sends a verification email to
 * an address that cannot be confirmed.
 */
export async function assertEmailAvailable(email: string) {
  const { data, error } = await supabase.rpc('email_is_available', { candidate: email.trim() });
  if (error) {
    if (error.message.includes('rate_limited')) throw new EmailCheckRateLimitedError();
    throw new Error(error.message);
  }
  if (data !== true) throw new EmailInUseError();
}

export async function requestEmailChange(email: string) {
  const { data, error } = await supabase.auth.updateUser(
    { email: email.trim() },
    { emailRedirectTo: getAuthRedirectUrl() },
  );
  if (error) throw error;
  return data;
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Matches Star Talks: use Supabase-hosted Google OAuth in the system browser,
 * then exchange the returned PKCE code into the app's persisted Supabase
 * session. A cancelled browser flow is a normal no-op and returns false.
 */
export async function signInWithGoogle() {
  const redirectTo = getAuthRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in did not return an authorization URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;

  await completeAuthRedirect(result.url);
  return true;
}

/**
 * Calls the delete-account Edge Function (needs the service role to delete
 * an auth.users row — a client can never do this directly). Signs the user
 * out locally afterward regardless of network timing, since the account is
 * gone either way.
 */
export async function deleteAccount() {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    throw new Error('No active session.');
  }

  const { error } = await supabase.functions.invoke('delete-account', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) throw error;

  await supabase.auth.signOut();
}
