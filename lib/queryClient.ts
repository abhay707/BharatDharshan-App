import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — cultural data changes rarely
      gcTime: 15 * 60 * 1000,     // 15 min cache retention
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
