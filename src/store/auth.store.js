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
// `persist` saves chosen slices of state to localStorage so they survive a
// full page reload. `devtools` is just for the Redux DevTools browser panel.
import { devtools, persist } from 'zustand/middleware'
import { decodeJwt } from '@/utils/jwt'
import { getDashboardPath } from '@/config/roleConfig'

const useAuthStore = create(
  devtools(
    persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────
      accessToken:     null,   // Raw JWT string (in-memory only)
      refreshToken:    null,   // Stored in memory — sent in body of /auth/refresh
      user:            null,   // Decoded payload: { userId, role, schoolId }
      isAuthenticated: false,
      isInitialised:   false,  // True after the first refresh-token check on mount

      // ── Actions ────────────────────────────────────────────

      /**
       * setTokens — called after login or token refresh.
       *
       * The JWT only carries { userId, role, schoolId, exp } — it does NOT
       * contain the user's name. The login endpoint returns a separate `user`
       * object that DOES have the name. So we accept that object here and merge
       * the name in, otherwise the dashboard greeting falls back to the role.
       *
       * @param {string} accessToken      - Raw JWT from backend response body
       * @param {string} [refreshToken]   - stored so refresh calls can send it in the body
       * @param {object} [userInfo]       - login `user` object: { id, name, role, schoolId }
       */
      setTokens: (accessToken, refreshToken, userInfo = null) => {
        const decoded = decodeJwt(accessToken)
        // decoded shape: { userId, role, schoolId, iat, exp }

        // Keep any name we already had (e.g. on a silent refresh where the
        // backend does NOT resend the user object) instead of wiping it.
        const previousName = get().user?.name ?? null

        set({
          accessToken,
          ...(refreshToken ? { refreshToken } : {}),
          user: {
            userId:   decoded.userId,
            role:     decoded.role,
            schoolId: decoded.schoolId,
            exp:      decoded.exp, // expiry timestamp (seconds)
            // Prefer the fresh name from login; otherwise keep the old one.
            name:     userInfo?.name ?? previousName,
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
    {
      // ── persist config ───────────────────────────────────────
      name: 'unicred-auth', // localStorage key
      // SECURITY: we deliberately do NOT persist the accessToken (short-lived,
      // XSS-sensitive). We persist only the long-lived refreshToken and the
      // user info (name/role/schoolId). On reload, ProtectedRoute uses the
      // saved refreshToken to silently fetch a brand-new accessToken.
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        user:         state.user,
      }),
    }
    ),
    { name: 'AuthStore' } // DevTools label
  )
)

export default useAuthStore