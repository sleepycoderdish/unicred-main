// src/api/client.js
// ─────────────────────────────────────────────────────────────
// Central Axios instance.
//
// Request interceptor:
//   Attaches the Bearer access token to every outgoing request
//   (unless the request is to an auth endpoint — those don't need it).
//
// Response interceptor:
//   On 401 Unauthorized: attempts a silent token refresh using the
//   HttpOnly refresh-token cookie (sent automatically by the browser).
//   If refresh succeeds → retries the original request with the new token.
//   If refresh fails    → clears auth state and redirects to login.
//
// Token refresh queue:
//   If multiple requests fail simultaneously with 401, only ONE refresh
//   call is made. All other requests wait for it to finish, then retry.
//   This prevents the "refresh storm" anti-pattern.
// ─────────────────────────────────────────────────────────────

import axios from 'axios'
import { AUTH_ENDPOINTS } from '@/config/constants'
import useAuthStore from '@/store/auth.store'

// ── Create instance ──────────────────────────────────────────
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000, // 15s — fail fast rather than hang
  headers: { 'Content-Type': 'application/json' },

  // withCredentials = true is REQUIRED for the browser to:
  //   (a) send the HttpOnly refresh-token cookie on requests
  //   (b) accept Set-Cookie headers from the backend
  // Without this, cookie-based refresh token auth DOES NOT WORK.
  withCredentials: true,
})

// ── Refresh-queue state ──────────────────────────────────────
// isRefreshing: prevents concurrent refresh calls
// failedQueue:  holds { resolve, reject } for requests waiting on refresh
let isRefreshing = false
let failedQueue  = []

/**
 * processQueue — resolves or rejects all queued requests after a refresh attempt.
 * @param {Error|null} error - If null, refresh succeeded; otherwise failed.
 * @param {string|null} token - New access token on success.
 */
function processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  failedQueue = []
}

// ── Auth endpoint check ──────────────────────────────────────
/**
 * isAuthEndpoint — returns true if the URL is an auth route.
 * These endpoints don't require a Bearer token and should not
 * trigger a token refresh loop if they return 401.
 */
function isAuthEndpoint(url = '') {
  const authPaths = [
    AUTH_ENDPOINTS.LOGIN,
    AUTH_ENDPOINTS.REGISTER,
    AUTH_ENDPOINTS.REFRESH_TOKEN,
    AUTH_ENDPOINTS.FORGOT_PASSWORD,
    AUTH_ENDPOINTS.RESET_PASSWORD,
    AUTH_ENDPOINTS.VERIFY_OTP,
    AUTH_ENDPOINTS.RESEND_OTP,
  ]
  return authPaths.some((path) => url.includes(path))
}

// ── Request interceptor ──────────────────────────────────────
// Runs before every outgoing request.
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState()

    // Attach Bearer token if we have one and it's not an auth endpoint
    if (accessToken && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ─────────────────────────────────────
// Runs after every response (success or failure).
apiClient.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // Only handle 401 for non-auth endpoints, and don't retry infinitely
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          // Retry with the new token once refresh completes
          originalRequest.headers.Authorization = `Bearer ${token}`
          return apiClient(originalRequest)
        })
      }

      // Mark this request so it doesn't loop
      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt silent refresh — browser sends HttpOnly cookie automatically
        // REQUEST : POST /api/auth/refresh (no body — cookie is sent automatically)
        // RESPONSE: { accessToken: string }
        const { data } = await axios.post(
          AUTH_ENDPOINTS.REFRESH_TOKEN,
          {},
          { withCredentials: true }
        )

        const newToken = data.accessToken
        useAuthStore.getState().setTokens(newToken)

        // Update the Authorization header for future requests
        apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`

        processQueue(null, newToken)

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed — session is truly expired
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()

        // Redirect to login (without React Router — we're outside component tree)
        window.location.href = '/auth/login?reason=session_expired'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
