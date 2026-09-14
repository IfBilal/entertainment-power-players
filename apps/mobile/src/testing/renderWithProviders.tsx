import type { ReactElement } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, type Metrics } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';

/**
 * `initialWindowMetrics` is null under the Jest test renderer (no real native
 * measurement pass ever fires), which leaves SafeAreaProvider's children
 * unrendered. Supplying explicit metrics unblocks it in tests.
 */
export const testMetrics: Metrics = {
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
  frame: { x: 0, y: 0, width: 390, height: 844 },
};

/**
 * Renders inside the same providers App.tsx supplies. Retries are off so a
 * failing query surfaces immediately instead of hanging the test for the
 * default backoff, and there's no cache shared between tests.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <SafeAreaProvider initialMetrics={testMetrics}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>{ui}</NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}
