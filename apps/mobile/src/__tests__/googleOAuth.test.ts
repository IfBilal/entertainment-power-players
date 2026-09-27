const mockSignInWithOAuth = jest.fn();
const mockOpenAuthSessionAsync = jest.fn();
const mockCompleteAuthRedirect = jest.fn();

jest.mock('../services/supabase/client', () => ({
  supabase: { auth: { signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args) } },
}));

jest.mock('expo-web-browser', () => ({
  openAuthSessionAsync: (...args: unknown[]) => mockOpenAuthSessionAsync(...args),
}));

jest.mock('../services/supabase/authRedirect', () => ({
  getAuthRedirectUrl: () => 'com.entertainmentpowerplayers.app://auth/callback',
  completeAuthRedirect: (...args: unknown[]) => mockCompleteAuthRedirect(...args),
}));

import { signInWithGoogle } from '../services/supabase/auth';

describe('Google OAuth', () => {
  beforeEach(() => {
    mockSignInWithOAuth.mockReset();
    mockOpenAuthSessionAsync.mockReset();
    mockCompleteAuthRedirect.mockReset();
  });

  it('starts Supabase OAuth and exchanges the returned app callback', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://supabase.test/google-oauth' }, error: null });
    mockOpenAuthSessionAsync.mockResolvedValue({
      type: 'success',
      url: 'com.entertainmentpowerplayers.app://auth/callback?code=oauth-code',
    });

    await expect(signInWithGoogle()).resolves.toBe(true);
    expect(mockSignInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'com.entertainmentpowerplayers.app://auth/callback',
        skipBrowserRedirect: true,
      },
    });
    expect(mockOpenAuthSessionAsync).toHaveBeenCalledWith(
      'https://supabase.test/google-oauth',
      'com.entertainmentpowerplayers.app://auth/callback',
    );
    expect(mockCompleteAuthRedirect).toHaveBeenCalledWith(
      'com.entertainmentpowerplayers.app://auth/callback?code=oauth-code',
    );
  });

  it('treats dismissing the provider browser as a cancellation', async () => {
    mockSignInWithOAuth.mockResolvedValue({ data: { url: 'https://supabase.test/google-oauth' }, error: null });
    mockOpenAuthSessionAsync.mockResolvedValue({ type: 'cancel' });

    await expect(signInWithGoogle()).resolves.toBe(false);
    expect(mockCompleteAuthRedirect).not.toHaveBeenCalled();
  });
});
