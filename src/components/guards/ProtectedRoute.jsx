// src/components/guards/ProtectedRoute.jsx
// ─────────────────────────────────────────────────────────────
// Route guard that blocks unauthenticated access.
//
// Behaviour:
//   - While the auth check is pending (isInitialised = false) → PageLoader
//   - If not authenticated → redirect to /auth/login (saves the intended URL
//     in location state so we can redirect back after login)
//   - If authenticated → render children
//
// Mount this around all dashboard routes in router.jsx.
//
// Token refresh on mount:
//   When the page first loads, the access token in memory is empty
//   (memory is cleared on refresh). This component triggers a silent
//   token refresh so users aren't forced to log in after every tab refresh.
// ─────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import useAuthStore from '@/store/auth.store'
import { PageLoader } from '@/components/ui/Loader'
import { ROUTES } from '@/config/constants'
import apiClient from '@/api/client'
import { AUTH_ENDPOINTS } from '@/config/constants'

/**
 * ProtectedRoute
 *
 * @param {{ children: React.ReactNode }} props
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialised, setTokens, clearAuth, setInitialised } = useAuthStore()
  const location = useLocation()

  useEffect(() => {
    // Only run the refresh check once on mount (not on every navigation)
    if (isInitialised) return

    /**
     * attemptSilentRefresh — calls /auth/refresh.
     * The HttpOnly refresh-token cookie is sent automatically by the browser.
     * If valid → backend returns a new access token → we're authenticated.
     * If invalid/expired → backend returns 401 → we clear auth.
     */
    async function attemptSilentRefresh() {
      try {
        // REQUEST : POST /api/auth/refresh
        //   Cookie : refreshToken (HttpOnly, sent automatically)
        //   Body   : (empty)
        //
        // RESPONSE: { accessToken: string }
        const { data } = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {})
        setTokens(data.accessToken)
      } catch {
        // Refresh failed = no valid session; user must log in
        clearAuth()
      } finally {
        // Mark initialisation complete regardless of outcome
        setInitialised()
      }
    }

    attemptSilentRefresh()
  }, [isInitialised, setTokens, clearAuth, setInitialised])

  // ── Not yet checked ──────────────────────────────────────
  if (!isInitialised) {
    return <PageLoader message="Checking session..." />
  }

  // ── Not authenticated ────────────────────────────────────
  if (!isAuthenticated) {
    // Save the URL the user was trying to visit so we can redirect after login
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  // ── Authenticated ────────────────────────────────────────
  return children
}

export default ProtectedRoute
