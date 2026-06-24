// src/App.jsx
// ─────────────────────────────────────────────────────────────
// Root component. Mounts all global providers:
//   - QueryClientProvider : React Query cache
//   - AppRouter           : All routes
//   - ToastContainer      : Global notification system
//
// Provider order matters:
//   QueryClientProvider wraps everything so any component can
//   use useQuery/useMutation without manually importing the client.
// ─────────────────────────────────────────────────────────────

import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient }    from '@/config/queryClient'
import { AppRouter }      from '@/router'
import { ToastContainer } from '@/components/ui/Toast'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/*
        AppRouter renders the RouterProvider with all routes.
        Every page and layout is inside this.
      */}
      <AppRouter />

      {/*
        ToastContainer reads from ui.store and renders notifications
        in the top-right corner. Mount once here — nothing else needed.
        Call useUiStore().toastSuccess/Error/Warning/Info() from anywhere.
      */}
      <ToastContainer />
    </QueryClientProvider>
  )
}
