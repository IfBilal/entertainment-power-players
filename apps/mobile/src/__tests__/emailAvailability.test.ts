const mockRpc = jest.fn();

jest.mock('../services/supabase/client', () => ({
  supabase: { rpc: (...args: unknown[]) => mockRpc(...args) },
}));

import { assertEmailAvailable, EmailCheckRateLimitedError, EmailInUseError } from '../services/supabase/auth';

describe('assertEmailAvailable', () => {
  beforeEach(() => mockRpc.mockReset());

  it('passes when the server reports the address is free', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });
    await expect(assertEmailAvailable('  new@example.com ')).resolves.toBeUndefined();
    expect(mockRpc).toHaveBeenCalledWith('email_is_available', { candidate: 'new@example.com' });
  });

  it('throws EmailInUseError when another account uses the address', async () => {
    mockRpc.mockResolvedValue({ data: false, error: null });
    await expect(assertEmailAvailable('taken@example.com')).rejects.toBeInstanceOf(EmailInUseError);
  });

  it('maps the server rate limit to EmailCheckRateLimitedError', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'rate_limited' } });
    await expect(assertEmailAvailable('x@example.com')).rejects.toBeInstanceOf(EmailCheckRateLimitedError);
  });

  it('rethrows other server errors so the screen can show them', async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: 'network down' } });
    await expect(assertEmailAvailable('x@example.com')).rejects.toThrow('network down');
  });
});
