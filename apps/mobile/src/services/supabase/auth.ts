import { supabase } from './client';

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
    options: fullName ? { data: { full_name: fullName } } : undefined,
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

// Password recovery needs its own destination -- a real page where someone
// can type a new password -- separate from the plain "you're confirmed"
// page used for signup. Without an explicit redirectTo here, Supabase falls
// back to the project's single global Site URL, which is the signup
// confirmation page: that's the bug reported live (reset email landed on
// "you're confirmed" with no way to actually set a new password).
const PASSWORD_RESET_REDIRECT_URL = 'https://entertainment-power-players-confirm.vercel.app/reset.html';

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: PASSWORD_RESET_REDIRECT_URL,
  });
  if (error) throw error;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Deliberately lazy — nothing from @react-native-google-signin/google-signin
 * runs at module load or app startup. `configure()` and the sign-in call both
 * happen only when this function is actually invoked (button press), so the
 * native module is never touched unless someone taps "Continue with Google".
 * In plain Expo Go (no dev client) the native module isn't linked and this
 * throws — callers show a friendly message instead of a crash. In the EAS
 * dev-client build it works normally. See docs/week2-implementation-plan.md
 * Workstream A.
 */
export async function signInWithGoogle() {
  const { GoogleSignin } = await import('@react-native-google-signin/google-signin');

  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  await GoogleSignin.hasPlayServices();
  const response = await GoogleSignin.signIn();
  const idToken = response.data?.idToken;
  if (!idToken) {
    throw new Error('No ID token returned from Google sign-in.');
  }

  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });
  if (error) throw error;
  return data;
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
