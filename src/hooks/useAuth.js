// src/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────
// Custom hook that wraps every auth action (login, register, logout, etc.)
// with loading state, error handling, toast notifications, and navigation.
//
// Why this hook?
//   Components shouldn't directly call the API or touch the store.
//   This hook is the single interface for all auth operations.
//   Swap the underlying store or API layer here — components don't change.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import useAuthStore from '@/store/auth.store'
import useUiStore   from '@/store/ui.store'

import * as authApi from '@/api/auth.api'
import { parseApiError } from '@/utils/errorHandler'
import { getDashboardPath } from '@/config/roleConfig'
import { ROUTES } from '@/config/constants'
// Shared React Query cache instance — imported so we can wipe it on logout.
// Wiping the cache on logout is the safest way to guarantee that no
// user-specific data (notifications, results, session info, etc.) cached
// during User A's session can ever be seen by User B who logs in next,
// even for a brief moment before queries refetch. The per-user cache key
// scoping in individual hooks (e.g. useNotifications.js) is the structural
// fix, but queryClient.clear() on logout is belt-and-suspenders insurance
// that covers every query in the app, not just notifications.
import { queryClient } from '@/config/queryClient'

export function useAuth() {
  const navigate = useNavigate()

  // Auth store state and actions
  const { setTokens, clearAuth, isAuthenticated, user } = useAuthStore()

  // Toast helpers
  const { toastSuccess, toastError } = useUiStore()

  // Local loading state per action
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  // ── Register ─────────────────────────────────────────────

  /**
   * register — creates a new student account and redirects to verify-email.
   *
   * @param {{ name: string, email: string, password: string }} formData
   */
  const register = useCallback(async (formData) => {
    setLoading(true)
    setError('')
    try {
      await authApi.registerStudent(formData)
      toastSuccess('Account created! Please verify your email.')
      // Pass email in state so VerifyEmail page knows where to send the OTP
      navigate(ROUTES.VERIFY_EMAIL, { state: { email: formData.email, source: 'register' } })
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
      toastError(message)
    } finally {
      setLoading(false)
    }
  }, [navigate, toastSuccess, toastError])

  // ── Login ─────────────────────────────────────────────────

  /**
   * login — authenticates and redirects to the role-specific dashboard.
   *
   * Email verification gate:
   *   The backend returns HTTP 403 with { code: 'EMAIL_NOT_VERIFIED' }
   *   when the account exists but the email hasn't been verified yet.
   *
   *   This is the ONLY case where we redirect to /auth/verify-email.
   *   Every other login (including already-verified users) goes straight
   *   to the dashboard — verification is never asked for again.
   *
   *   source: 'login' is passed in location.state so VerifyEmail knows
   *   NOT to auto-fire sendOtp (the user must click "Send code" manually,
   *   since they didn't just register and may already have a valid OTP).
   *
   * @param {{ email: string, password: string }} formData
   * @param {{ from?: string|null }} [options] - where to go on success (defaults to the role dashboard)
   * @returns {Promise<boolean>} true if login succeeded, false otherwise (wrong password, unverified, etc.)
   */
  const login = useCallback(async (formData, options = {}) => {
    setLoading(true)
    setError('')
    try {
      // REQUEST : POST /api/auth/login  { email, password }
      // RESPONSE: { accessToken: string, refreshToken: string, user: {...} }
      //   accessToken payload = { userId, role, schoolId, iat, exp }
      const loginRes = await authApi.login(formData)

      // API may return tokens at the top level or nested under .data
      const tokenData = loginRes?.data ?? loginRes
      const { accessToken, refreshToken, user } = tokenData

      // Store tokens + the user object so the dashboard can greet by name.
      // (The JWT itself does not contain the name — only the user object does.)
      setTokens(accessToken, refreshToken, user)

      // Decide where to go: the page the user originally wanted (options.from),
      // otherwise their role's dashboard.
      const role        = useAuthStore.getState().user?.role
      const destination = options.from || getDashboardPath(role)

      toastSuccess('Welcome back!')
      navigate(destination, { replace: true })
      return true // <-- tells the caller login succeeded

    } catch (err) {
      const { message, status, code, fieldErrors } = parseApiError(err)

      // ── Unverified email interception ──────────────────────
      // The backend blocks login until the email is verified. Different
      // backends phrase this differently, so we match several signals instead
      // of one exact string:
      //   - a machine code like EMAIL_NOT_VERIFIED / NOT_VERIFIED, OR
      //   - any message that mentions both "verif" and "email", OR
      //   - a message that says "not verified".
      // We only treat it as "unverified" on a 401/403 (an auth-type failure),
      // so a plain wrong password (also 401) is NOT misread as unverified.
      const msg = (message || '').toLowerCase()
      const codeStr = (code || '').toUpperCase()
      const looksUnverified =
        codeStr.includes('VERIF') ||                 // EMAIL_NOT_VERIFIED, NOT_VERIFIED, ...
        (msg.includes('verif') && msg.includes('email')) ||
        msg.includes('not verified')

      const isUnverified = (status === 401 || status === 403) && looksUnverified

      if (isUnverified) {
        // Redirect to verify-email.
        // source: 'login' tells VerifyEmail this came from a login attempt.
        navigate(ROUTES.VERIFY_EMAIL, {
          state: { email: formData.email, source: 'login' },
        })
        return false // login did NOT succeed — caller must not redirect anywhere else
      }

      // ── All other errors (wrong password, account locked, etc.) ──
      setError(message)
      toastError(message)
      return false

    } finally {
      setLoading(false)
    }
  }, [navigate, setTokens, toastSuccess, toastError])

  // ── Logout ────────────────────────────────────────────────

  /**
   * logout — logs out from the current device.
   */
  const logout = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logout()
    } catch {
      // Even if the API call fails, clear local auth state.
      // The backend will eventually expire the refresh token.
    } finally {
      // Wipe the entire React Query cache before clearing auth state.
      // This ensures no stale, user-specific data (notifications, results,
      // sessions, etc.) is visible to the next user who logs in on this tab.
      queryClient.clear()
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
      setLoading(false)
    }
  }, [clearAuth, navigate])

  /**
   * logoutAll — logs out from all devices.
   */
  const logoutAll = useCallback(async () => {
    setLoading(true)
    try {
      await authApi.logoutAll()
      toastSuccess('Logged out from all devices.')
    } catch (err) {
      const { message } = parseApiError(err)
      toastError(message)
    } finally {
      // Same cache wipe as logout — all devices logout also switches
      // the local user context, so cached data must not survive.
      queryClient.clear()
      clearAuth()
      navigate(ROUTES.LOGIN, { replace: true })
      setLoading(false)
    }
  }, [clearAuth, navigate, toastSuccess, toastError])

  // ── OTP ───────────────────────────────────────────────────

  /**
   * sendOtp — sends or resends OTP to an email.
   * @param {string} email
   * @returns {Promise<boolean>} true on success
   */
  const sendOtp = useCallback(async (email) => {
    setLoading(true)
    setError('')
    try {
      await authApi.resendOtp(email)
      toastSuccess('OTP sent to your email.')
      return true
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
      toastError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [toastSuccess, toastError])

  /**
   * verifyOtp — verifies the OTP for email verification.
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<boolean>}
   */
  const verifyOtp = useCallback(async (email, otp) => {
    setLoading(true)
    setError('')
    try {
      await authApi.verifyOtp(email, otp)
      toastSuccess('Email verified! You can now log in.')
      navigate(ROUTES.LOGIN)
      return true
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
      toastError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [navigate, toastSuccess, toastError])

  // ── Forgot / Reset Password ───────────────────────────────

  /**
   * forgotPassword — sends reset OTP to email.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  const forgotPassword = useCallback(async (email) => {
    setLoading(true)
    setError('')
    try {
      await authApi.forgotPassword(email)
      toastSuccess('OTP sent to your email.')
      navigate(ROUTES.RESET_PASSWORD, { state: { email } })
      return true
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
      toastError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [navigate, toastSuccess, toastError])

  /**
   * resetPassword — verifies OTP and updates password.
   * @param {{ email: string, otp: string, newPassword: string }} data
   * @returns {Promise<boolean>}
   */
  const resetPassword = useCallback(async (data) => {
    setLoading(true)
    setError('')
    try {
      await authApi.resetPassword(data)
      toastSuccess('Password reset! Please log in with your new password.')
      navigate(ROUTES.LOGIN)
      return true
    } catch (err) {
      const { message } = parseApiError(err)
      setError(message)
      toastError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [navigate, toastSuccess, toastError])

  return {
    // State
    isAuthenticated,
    user,
    loading,
    error,

    // Actions
    register,
    login,
    logout,
    logoutAll,
    sendOtp,
    verifyOtp,
    forgotPassword,
    resetPassword,

    // Helper to clear the error (e.g. when user starts typing again)
    clearError: () => setError(''),
  }
}