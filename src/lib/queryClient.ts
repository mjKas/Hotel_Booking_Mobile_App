import { QueryClient } from '@tanstack/react-query';

import { ApiError } from '../api/apiError';

/**
 * The app's single query cache.
 *
 * It lives in its own module, rather than inside `app/_layout.tsx`, so the
 * auth store can wipe it on sign-out: cached bookings and accounts belong to
 * whoever was signed in and must never be shown to the next person.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // A 4xx will not fix itself on retry, and retrying a 401 fights with the
      // token refresh already built into apiClient.
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }

        return failureCount < 2;
      },
      staleTime: 30_000,
    },
    mutations: { retry: false },
  },
});
