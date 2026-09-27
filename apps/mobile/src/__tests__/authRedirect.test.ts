const mockSetSession = jest.fn();
const mockExchangeCodeForSession = jest.fn();
const mockVerifyOtp = jest.fn();
const mockCreateUrl = jest.fn((path: string) => `com.entertainmentpowerplayers.app://${path}`);

jest.mock('../services/supabase/client', () => ({
  supabase: {
    auth: {
      setSession: (...args: unknown[]) => mockSetSession(...args),
      exchangeCodeForSession: (...args: unknown[]) => mockExchangeCodeForSession(...args),
      verifyOtp: (...args: unknown[]) => mockVerifyOtp(...args),
    },
  },
}));

jest.mock('expo-linking', () => ({ createURL: (path: string) => mockCreateUrl(path) }));

import { completeAuthRedirect, getAuthRedirectUrl, isAuthCallbackUrl } from '../services/supabase/authRedirect';

describe('Supabase app auth redirects', () => {
  beforeEach(() => {
    mockSetSession.mockReset();
    mockExchangeCodeForSession.mockReset();
    mockVerifyOtp.mockReset();
    mockCreateUrl.mockClear();
  });

  it('creates the same app callback route used for all email flows', () => {
    expect(getAuthRedirectUrl()).toBe('com.entertainmentpowerplayers.app://auth/callback');
    expect(mockCreateUrl).toHaveBeenCalledWith('auth/callback');
  });

  it('recognizes the installed-app and Expo Go callback URLs only', () => {
    expect(isAuthCallbackUrl('com.entertainmentpowerplayers.app://auth/callback')).toBe(true);
    expect(isAuthCallbackUrl('exp://192.168.1.10:8081/--/auth/callback?type=recovery')).toBe(true);
    expect(isAuthCallbackUrl('https://example.com/auth/callback')).toBe(false);
    expect(isAuthCallbackUrl('com.entertainmentpowerplayers.app://auth/other')).toBe(false);
  });

  it('stores a signup session from tokens in the URL fragment', async () => {
    mockSetSession.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null });

    const result = await completeAuthRedirect(
      'com.entertainmentpowerplayers.app://auth/callback#access_token=access&refresh_token=refresh&type=signup',
    );

    expect(result).toEqual({ kind: 'signup', session: { user: { id: 'user-1' } } });
    expect(mockSetSession).toHaveBeenCalledWith({ access_token: 'access', refresh_token: 'refresh' });
  });

  it('exchanges a recovery code and identifies the password-reset flow', async () => {
    mockExchangeCodeForSession.mockResolvedValue({ data: { session: { user: { id: 'user-2' } } }, error: null });

    const result = await completeAuthRedirect('com.entertainmentpowerplayers.app://auth/callback?code=pkce-code&type=recovery');

    expect(result.kind).toBe('recovery');
    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('pkce-code');
  });

  it('verifies an email-change token hash', async () => {
    mockVerifyOtp.mockResolvedValue({ data: { session: null }, error: null });

    const result = await completeAuthRedirect(
      'com.entertainmentpowerplayers.app://auth/callback?token_hash=one-time-hash&type=email_change',
    );

    expect(result.kind).toBe('email-change');
    expect(mockVerifyOtp).toHaveBeenCalledWith({ token_hash: 'one-time-hash', type: 'email_change' });
  });
});
