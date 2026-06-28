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
    // Run only once — skip if already initialised
    if (isInitialised) return

    // KEY FIX: if the user just logged in, isAuthenticated is already true
    // in memory. No need to call the refresh endpoint — just mark initialised
    // and let them through. Calling refresh here was causing the logout loop:
    // login → navigate → ProtectedRoute fires refresh → refresh fails (no token
    // in body yet) → clearAuth → logged out → second login works because
    // isInitialised is now true and this block is skipped.
    if (isAuthenticated) {
      setInitialised()
      return
    }

    /**
     * attemptSilentRefresh — only runs on a hard page reload when the
     * access token has been lost from memory. Sends the stored refresh token
     * in the request body (backend may also read from cookie).
     */
    async function attemptSilentRefresh() {
      try {
        // Get the stored refresh token (set during login)
        const storedRefreshToken = useAuthStore.getState().refreshToken

        // REQUEST : POST /api/auth/refresh
        //   Body  : { refreshToken } — required by the backend
        //   Cookie: refreshToken (HttpOnly) — also sent if server set one
        const res = await apiClient.post(AUTH_ENDPOINTS.REFRESH_TOKEN, {
          ...(storedRefreshToken ? { refreshToken: storedRefreshToken } : {}),
        })

        // Backend returns new tokens — handle both flat and nested shapes
        const tokenData = res.data?.data ?? res.data
        setTokens(tokenData.accessToken, tokenData.refreshToken)
      } catch {
        // Truly no valid session — user must log in
        clearAuth()
      } finally {
        setInitialised()
      }
    }

    attemptSilentRefresh()
  }, [isInitialised, isAuthenticated, setTokens, clearAuth, setInitialised])

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
