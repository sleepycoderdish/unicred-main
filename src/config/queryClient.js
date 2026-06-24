// src/config/queryClient.js
// ─────────────────────────────────────────────────────────────
// TanStack React Query client configuration.
// One shared instance is created here and passed to QueryClientProvider
// in main.jsx. This ensures all queries share the same cache.
// ─────────────────────────────────────────────────────────────

import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus in development — reduces noise
      refetchOnWindowFocus: import.meta.env.PROD,

      // Retry failed queries once before showing error
      retry: 1,

      // How long data stays "fresh" before a background refetch (5 min)
      staleTime: 5 * 60 * 1000,

      // How long unused data stays in cache before being garbage collected (10 min)
      gcTime: 10 * 60 * 1000,
    },
    mutations: {
      // Don't retry mutations — they have side effects
      retry: false,
    },
  },
})
