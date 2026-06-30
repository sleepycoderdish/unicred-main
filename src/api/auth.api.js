// src/api/auth.api.js
// ─────────────────────────────────────────────────────────────
// All authentication API calls.
// Each function maps to one backend endpoint from the proposal.
//
// Every function:
//   - Uses the shared Axios instance (apiClient) for interceptor support
//   - Returns the response data directly (not the full Axios response)
//   - Throws on error — callers must try/catch and use parseApiError()
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'
import { AUTH_ENDPOINTS } from '@/config/constants'

// ── Register ─────────────────────────────────────────────────

/**
 * registerStudent — creates a new student account.
 * Only students self-register; faculty/HOD/admin are created by admins.
 *
 * REQUEST  : POST /api/auth/register
 *   Body   : { email: string, name: string, password: string }
 *
 * RESPONSE : 201 Created
 *   Body   : { message: "Account created. Please verify your email." }
 *
 * After success, redirect to /auth/verify-email?email=...
 *
 * @param {{ email: string, name: string, password: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function registerStudent(data) {
  const res = await apiClient.post(AUTH_ENDPOINTS.REGISTER, {
    email:    data.email.trim().toLowerCase(),
    name:     data.name.trim(),
    password: data.password,
  })
  return res.data.data
}

// ── Email Verification ────────────────────────────────────────

/**
 * resendOtp — (re)sends a 6-digit OTP to the given email.
 * Used on the verify-email page: first call sends OTP, subsequent
 * calls re-send after the 30-second timer expires.
 *
 * REQUEST  : POST /api/auth/resend-otp
 *   Body   : { email: string }
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "OTP sent to your email." }
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function resendOtp(email) {
  const res = await apiClient.post(AUTH_ENDPOINTS.RESEND_OTP, {
    email: email.trim().toLowerCase(),
  })
  return res.data.data
}

/**
 * verifyOtp — verifies the OTP and marks the email as verified.
 *
 * REQUEST  : POST /api/auth/verify-otp
 *   Body   : { email: string, otp: string }
 *   Note   : OTP is sent as an integer per the proposal.
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "Email verified successfully." }
 *
 * After success, redirect to /auth/login
 *
 * @param {string} email
 * @param {string} otp - 6-digit string; converted to number before sending
 * @returns {Promise<{ message: string }>}
 */
export async function verifyOtp(email, otp) {
  const res = await apiClient.post(AUTH_ENDPOINTS.VERIFY_OTP, {
    email: email.trim().toLowerCase(),
    otp:   otp // Backend expects int
  })
  return res.data.data
}

// ── Login ─────────────────────────────────────────────────────

/**
 * login — authenticates a user and returns tokens.
 *
 * REQUEST  : POST /api/auth/login
 *   Body   : { email: string, password: string }
 *
 * RESPONSE : 200 OK
 *   Body   : { accessToken: string }
 *   Cookie : refreshToken (HttpOnly, Secure, SameSite=Strict, 7-day expiry)
 *            Set by backend — JavaScript cannot read this cookie.
 *   Note   : accessToken payload = { userId, role, schoolId, iat, exp }
 *            accessToken expiry = 15 minutes
 *
 * After success:
 *   1. Store accessToken in auth store (memory only)
 *   2. Decode JWT to get role
 *   3. Redirect to role-specific dashboard
 *
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ accessToken: string }>}
 */
export async function login(data) {
  const res = await apiClient.post(AUTH_ENDPOINTS.LOGIN, {
    email:    data.email.trim().toLowerCase(),
    password: data.password,
  })
  return res.data.data
}

// ── Logout ────────────────────────────────────────────────────

/**
 * logout — logs out from the current device.
 * Browser sends the refreshToken cookie automatically (withCredentials: true).
 * Backend invalidates that specific refresh token.
 *
 * REQUEST  : POST /api/auth/logout
 *   Cookie : refreshToken (sent automatically)
 *   Body   : (empty)
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "Logged out successfully." }
 *
 * After success, clear auth store and redirect to /auth/login.
 *
 * @returns {Promise<{ message: string }>}
 */
export async function logout() {
  const res = await apiClient.post(AUTH_ENDPOINTS.LOGOUT)
  return res.data.data
}

/**
 * logoutAll — logs out from ALL devices.
 * Invalidates every refresh token family for the user.
 *
 * REQUEST  : POST /api/auth/logout-all
 *   Header : Authorization: Bearer <accessToken>  (attached by Axios interceptor)
 *   Body   : (empty)
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "Logged out from all devices." }
 *
 * @returns {Promise<{ message: string }>}
 */
export async function logoutAll() {
  const res = await apiClient.post(AUTH_ENDPOINTS.LOGOUT_ALL)
  return res.data.data
}

// ── Forgot / Reset Password ───────────────────────────────────

/**
 * forgotPassword — sends a password-reset OTP to the email.
 *
 * REQUEST  : POST /api/auth/forgot-password
 *   Body   : { email: string }
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "Password reset OTP sent to your email." }
 *
 * After success, redirect to /auth/reset-password?email=...
 *
 * @param {string} email
 * @returns {Promise<{ message: string }>}
 */
export async function forgotPassword(email) {
  const res = await apiClient.post(AUTH_ENDPOINTS.FORGOT_PASSWORD, {
    email: email.trim().toLowerCase(),
  })
  return res.data.data
}

/**
 * resetPassword — verifies OTP and sets a new password.
 *
 * REQUEST  : POST /api/auth/reset-password
 *   Body   : { email: string, otp: string, newPassword: string }
 *   Note   : otp is sent as string per the proposal (unlike verify-otp).
 *
 * RESPONSE : 200 OK
 *   Body   : { message: "Password reset successfully. Please log in." }
 *
 * After success, redirect to /auth/login
 *
 * @param {{ email: string, otp: string, newPassword: string }} data
 * @returns {Promise<{ message: string }>}
 */
export async function resetPassword(data) {
  const res = await apiClient.post(AUTH_ENDPOINTS.RESET_PASSWORD, {
    email:       data.email.trim().toLowerCase(),
    otp:         data.otp,         // string per proposal
    newPassword: data.newPassword,
  })
  return res.data.data
}

// ── Invite a new user (admin / hod) ───────────────────────────

/**
 * inviteUser — admin or HOD invites a new faculty (or HOD) account.
 *
 * This is a PROTECTED route: the logged-in admin/HOD token is attached
 * automatically by the Axios interceptor. The backend creates the account,
 * generates a temporary password, and emails it to the invitee. The invitee
 * then logs in with that password and completes their profile.
 *
 * REQUEST  : POST /api/auth/invite
 *   Header : Authorization: Bearer <accessToken>  (attached automatically)
 *   Body   : { email: string, name: string, role: "faculty" | "hod" }
 *
 * RESPONSE : 201
 *   { success: true, message: "Invitation sent.", data: { userId } }
 *
 * @param {{ email: string, name: string, role: string }} data
 * @returns {Promise<object>} the response body (envelope)
 */
export async function inviteUser(data) {
  const res = await apiClient.post(AUTH_ENDPOINTS.INVITE, {
    email: data.email.trim().toLowerCase(),
    name:  data.name.trim(),
    role:  data.role,
  })
  return res.data
}