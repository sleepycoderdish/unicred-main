// src/store/auth.store.js
// ─────────────────────────────────────────────────────────────
// Global authentication state using Zustand.
//
// Why Zustand over Context?
//   - No re-render cascade from a Provider wrapping the whole tree
//   - Components subscribe only to the slice they need
//   - Persist middleware handles storage without boilerplate
//
// Token strategy:
//   - Access token  : stored in memory (this store). NEVER in localStorage —
//                     that's vulnerable to XSS attacks.
//   - Refresh token : HttpOnly cookie set by the backend. JavaScript cannot
//                     read it — that's intentional security.
//
// Flow on page refresh:
//   Access token is lost (memory cleared), but the HttpOnly cookie survives.
//   App calls /auth/refresh on mount → backend validates cookie → returns
//   new access token → store is repopulated.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { decodeJwt } from '@/utils/jwt'
import { getDashboardPath } from '@/config/roleConfig'

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      accessToken:     null,   // Raw JWT string (in-memory only)
      refreshToken:    null,   // Stored in memory — sent in body of /auth/refresh
      user:            null,   // Decoded payload: { userId, role, schoolId }
      isAuthenticated: false,
      isInitialised:   false,  // True after the first refresh-token check on mount

      // ── Actions ────────────────────────────────────────────

      /**
       * setTokens — called after successful login or token refresh.
       * Decodes the JWT to extract user info (role, userId, schoolId).
       *
       * @param {string} accessToken - Raw JWT from backend response body
       */
      /**
       * setTokens — called after login or token refresh.
       * @param {string} accessToken
       * @param {string} [refreshToken] - stored in memory so refresh calls can send it in the body
       */
      setTokens: (accessToken, refreshToken) => {
        const decoded = decodeJwt(accessToken)
        // decoded shape: { userId, role, schoolId, iat, exp }

        set({
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
          user: {
            userId:   decoded.userId,
            role:     decoded.role,
            schoolId: decoded.schoolId,
            exp:      decoded.exp, // expiry timestamp (seconds)
          },
          isAuthenticated: true,
        }, false, 'setTokens')
      },

      /**
       * clearAuth — clears all auth state.
       * Called on logout or when refresh token is expired/invalid.
       */
      clearAuth: () => {
        set({
          accessToken:     null,
          refreshToken:    null,
          user:            null,
          isAuthenticated: false,
        }, false, 'clearAuth')
      },

      /**
       * setInitialised — marks that the initial refresh-token check is done.
       * Until this is true, ProtectedRoute renders a full-screen loader.
       */
      setInitialised: () => {
        set({ isInitialised: true }, false, 'setInitialised')
      },

      // ── Selectors (derived state, no re-render cost) ────────

      /** Returns the role of the logged-in user, or null. */
      getRole: () => get().user?.role ?? null,

      /** Returns the schoolId of the logged-in user, or null. */
      getSchoolId: () => get().user?.schoolId ?? null,

      /** Returns the dashboard path for the logged-in user's role. */
      getDashboard: () => {
        const role = get().user?.role
        return getDashboardPath(role)
      },

      /**
       * isTokenExpired — checks if the access token's exp has passed.
       * Used by the Axios interceptor to decide whether to refresh proactively.
       * @returns {boolean}
       */
      isTokenExpired: () => {
        const exp = get().user?.exp
        if (!exp) return true
        // Compare against current time (exp is in seconds, Date.now() in ms)
        return Date.now() / 1000 > exp - 30 // refresh 30s before expiry
      },
    }),
    { name: 'AuthStore' } // DevTools label
  )
)

export default useAuthStore