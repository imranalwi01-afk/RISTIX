import { QueryClient } from '@tanstack/react-query';
import { normalizeQueryError } from './query-errors';

let browserQueryClient: QueryClient | null = null;

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          const normalized = normalizeQueryError(error);
          if (normalized.isAuthError || normalized.isForbidden || normalized.isConflict) {
            return false;
          }
          return failureCount < 1;
        },
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

export function getQueryClient() {
  if (typeof window === 'undefined') {
    return createQueryClient();
  }

  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }

  return browserQueryClient;
}
