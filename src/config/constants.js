// src/config/constants.js
// ─────────────────────────────────────────────────────────────
// Central place for ALL magic strings and configuration values.
// Never hardcode these inline — changing one value here updates everything.
// ─────────────────────────────────────────────────────────────

// ── API ──────────────────────────────────────────────────────
// Base URL for all backend requests.
// In development, Vite proxy rewrites /api → backend (see vite.config.js).
// In production, Vite reads VITE_API_BASE_URL from .env.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// ── Token storage keys ────────────────────────────────────────
// Access token is stored in memory (Zustand store) for security.
// Refresh token is stored as an HttpOnly cookie by the backend — we never touch it directly.
export const ACCESS_TOKEN_KEY = 'unicred_access_token'

// ── Auth endpoints ────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  REGISTER:         '/api/auth/register',
  LOGIN:            '/api/auth/login',
  LOGOUT:           '/api/auth/logout',
  LOGOUT_ALL:       '/api/auth/logout-all',
  RESEND_OTP:       '/api/auth/resend-otp',
  VERIFY_OTP:       '/api/auth/verify-otp',
  FORGOT_PASSWORD:  '/api/auth/forgot-password',
  RESET_PASSWORD:   '/api/auth/reset-password',
  REFRESH_TOKEN:    '/api/auth/refresh',           // Backend should implement this
}

// ── Role constants ────────────────────────────────────────────
// Must match the Role enum in Prisma schema exactly.
export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  HOD:     'hod',
  ADMIN:   'admin',
}

// ── Route paths ───────────────────────────────────────────────
// All client-side routes defined here. Import these in router.jsx and Link components.
export const ROUTES = {
  // Public
  LANDING:          '/',
  LOGIN:            '/auth/login',
  REGISTER:         '/auth/register',
  VERIFY_EMAIL:     '/auth/verify-email',
  FORGOT_PASSWORD:  '/auth/forgot-password',
  RESET_PASSWORD:   '/auth/reset-password',

  // Role dashboards (root for each role)
  STUDENT_DASHBOARD:  '/student',
  FACULTY_DASHBOARD:  '/faculty',
  HOD_DASHBOARD:      '/hod',
  ADMIN_DASHBOARD:    '/admin',
}

// ── Role → redirect map ───────────────────────────────────────
// After login, redirect each role to their dashboard.
export const ROLE_REDIRECT = {
  [ROLES.STUDENT]: ROUTES.STUDENT_DASHBOARD,
  [ROLES.FACULTY]: ROUTES.FACULTY_DASHBOARD,
  [ROLES.HOD]:     ROUTES.HOD_DASHBOARD,
  [ROLES.ADMIN]:   ROUTES.ADMIN_DASHBOARD,
}

// ── OTP config ────────────────────────────────────────────────
export const OTP_LENGTH         = 6    // Number of OTP digits
export const OTP_RESEND_SECONDS = 30   // Countdown before "Resend" button re-enables
export const OTP_EXPIRY_MINUTES = 10   // How long an OTP is valid (for UI messaging)

// ── Password rules (must match backend validation) ───────────
export const PASSWORD_MIN_LENGTH = 8

// ── App metadata ──────────────────────────────────────────────
export const APP_NAME    = import.meta.env.VITE_APP_NAME || 'Unicred'
export const APP_TAGLINE = 'Academic Management Platform'
