import { useEffect, useState } from 'react';

/**
 * Handbook §4.2 asks for search "Debounced 300 ms" — this delays the value
 * the filter actually runs against, so typing doesn't refilter on every
 * keystroke while the visible input stays instant.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
