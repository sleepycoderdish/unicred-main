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
   */
  const login = useCallback(async (formData) => {
    setLoading(true)
    setError('')
    try {
      // REQUEST : POST /api/auth/login  { email, password }
      // RESPONSE: { accessToken: string, refreshToken: string, user: {...} }
      //   accessToken payload = { userId, role, schoolId, iat, exp }
      const loginRes = await authApi.login(formData)

      // API may return tokens at the top level or nested under .data
      const tokenData = loginRes?.data ?? loginRes
      const { accessToken, refreshToken } = tokenData

      // Store both tokens — refreshToken sent in body on next /auth/refresh call
      setTokens(accessToken, refreshToken)

      // Read role from store (just set above) and navigate to its dashboard
      const role      = useAuthStore.getState().user?.role
      const dashboard = getDashboardPath(role)

      toastSuccess('Welcome back!')
      navigate(dashboard, { replace: true })

    } catch (err) {
      const { message, status, fieldErrors } = parseApiError(err)

      // ── Unverified email interception ──────────────────────
      // Backend returns 401 with "Please verify your email before logging in"
      // Matching on message text is safer than status code alone — a wrong
      // password also returns 401, so we need the message to distinguish.
      const isUnverified =
        (status === 401 || status === 403) &&
        message?.toLowerCase().includes('verify your email')

      if (isUnverified) {
        // Redirect to verify-email.
        // source: 'login' tells VerifyEmail NOT to auto-send OTP on mount —
        // the user may already have a valid code in their inbox.
        navigate(ROUTES.VERIFY_EMAIL, {
          state: { email: formData.email, source: 'login' },
        })
        return // Don't set error — this is a normal redirect, not a failure
      }

      // ── All other errors (wrong password, account locked, etc.) ──
      setError(message)
      toastError(message)

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