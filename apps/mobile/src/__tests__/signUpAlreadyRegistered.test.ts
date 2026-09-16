/**
 * Supabase returns a 200 with a synthetic user (empty `identities`) rather
 * than an error when signUp() is called with an email that already belongs
 * to a *confirmed* account -- deliberate, to stop the signup endpoint being
 * used to enumerate registered emails. signUpWithEmail must translate that
 * specific shape into a real, catchable error so the UI shows "this email
 * already has an account" instead of the misleading "check your email to
 * confirm" (bug reported during Week 2 device testing).
 */
const mockSignUp = jest.fn();

jest.mock('../services/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: (...args: unknown[]) => mockSignUp(...args),
    },
  },
}));

import { EmailAlreadyRegisteredError, signUpWithEmail } from '../services/supabase/auth';

describe('signUpWithEmail', () => {
  beforeEach(() => {
    mockSignUp.mockReset();
  });

  it('returns data normally for a genuinely new signup', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'u1', identities: [{ id: 'i1' }] },
        session: null,
      },
      error: null,
    });

    const data = await signUpWithEmail('new@example.com', 'password123');
    expect(data.user?.id).toBe('u1');
  });

  it('throws EmailAlreadyRegisteredError when identities is empty (already-confirmed email)', async () => {
    mockSignUp.mockResolvedValue({
      data: {
        user: { id: 'fake-id', identities: [] },
        session: null,
      },
      error: null,
    });

    await expect(signUpWithEmail('taken@example.com', 'password123')).rejects.toThrow(
      EmailAlreadyRegisteredError,
    );
    await expect(signUpWithEmail('taken@example.com', 'password123')).rejects.toThrow(
      /already exists/i,
    );
  });

  it('still throws a real Supabase error normally (e.g. weak password)', async () => {
    mockSignUp.mockResolvedValue({
      data: { user: null, session: null },
      error: new Error('Password should be at least 6 characters.'),
    });

    await expect(signUpWithEmail('new@example.com', '123')).rejects.toThrow(
      /at least 6 characters/,
    );
  });
});
