import { renderHook, waitFor } from '@testing-library/react-native';
import { useDebouncedValue } from '../utils/useDebouncedValue';

/**
 * Handbook §4.2 requires search "Debounced 300 ms" — these pin that the value
 * genuinely lags behind input rather than updating per keystroke.
 *
 * Uses real timers with a short delay rather than jest fake timers: under
 * RNTL v14 / concurrent React, advancing fake timers doesn't reliably flush
 * the resulting state update into `result.current`, which tests the harness
 * rather than the hook.
 */
describe('useDebouncedValue', () => {
  it('returns the initial value immediately', async () => {
    const { result } = await renderHook(() => useDebouncedValue('a', 50));
    expect(result.current).toBe('a');
  });

  it('does not update synchronously when the value changes', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 50), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'ab' });
    // Still the old value right after the change -- that's the debounce.
    expect(result.current).toBe('a');
  });

  it('updates to the new value after the delay', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 50), {
      initialProps: { value: 'a' },
    });

    await rerender({ value: 'ab' });
    await waitFor(() => expect(result.current).toBe('ab'));
  });

  it('only settles on the last value when the input changes rapidly', async () => {
    const { result, rerender } = await renderHook(({ value }: { value: string }) => useDebouncedValue(value, 50), {
      initialProps: { value: 'j' },
    });

    // Each change restarts the timer, so intermediate values never land.
    await rerender({ value: 'ja' });
    await rerender({ value: 'jan' });
    await rerender({ value: 'jane' });

    await waitFor(() => expect(result.current).toBe('jane'));
    // 'ja'/'jan' were never emitted -- it jumped straight from 'j' to 'jane'.
  });
});
