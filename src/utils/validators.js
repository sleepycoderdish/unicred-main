// src/utils/validators.js
// ─────────────────────────────────────────────────────────────
// Pure validation functions used in auth forms.
// Each function returns an error string (non-empty = invalid)
// or an empty string "" (valid).
//
// These are kept as plain functions (not a validation library)
// so they can be used with any form library or plain useState.
// ─────────────────────────────────────────────────────────────

import { PASSWORD_MIN_LENGTH } from '@/config/constants'

// ── Email ────────────────────────────────────────────────────

/**
 * validateEmail — checks format with a basic RFC-compatible regex.
 * @param {string} value
 * @returns {string} error message, or "" if valid
 */
export function validateEmail(value) {
  if (!value?.trim()) return 'Email is required'
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(value.trim())) return 'Enter a valid email address'
  return ''
}

// ── Name ─────────────────────────────────────────────────────

/**
 * validateName — ensures name is at least 2 chars and only letters/spaces.
 * @param {string} value
 * @returns {string}
 */
export function validateName(value) {
  if (!value?.trim()) return 'Full name is required'
  if (value.trim().length < 2) return 'Name must be at least 2 characters'
  if (!/^[a-zA-Z\s'-]+$/.test(value.trim())) return 'Name contains invalid characters'
  return ''
}

// ── Password ─────────────────────────────────────────────────

/**
 * validatePassword — enforces password rules.
 * Rules (must match backend validation):
 *   - At least PASSWORD_MIN_LENGTH characters
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one digit
 *
 * @param {string} value
 * @returns {string}
 */
export function validatePassword(value) {
  if (!value) return 'Password is required'
  if (value.length < PASSWORD_MIN_LENGTH)
    return `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  if (!/[A-Z]/.test(value)) return 'Must include at least one uppercase letter'
  if (!/[a-z]/.test(value)) return 'Must include at least one lowercase letter'
  if (!/[0-9]/.test(value)) return 'Must include at least one number'
  return ''
}

/**
 * validateConfirmPassword — checks that two passwords match.
 * @param {string} password
 * @param {string} confirm
 * @returns {string}
 */
export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password'
  if (password !== confirm) return 'Passwords do not match'
  return ''
}

// ── OTP ──────────────────────────────────────────────────────

/**
 * validateOtp — checks that OTP is exactly 6 digits.
 * @param {string} value
 * @returns {string}
 */
export function validateOtp(value) {
  if (!value?.trim()) return 'OTP is required'
  if (!/^\d{6}$/.test(value.replace(/\s/g, ''))) return 'Enter the 6-digit code from your email'
  return ''
}

// ── Password strength score ───────────────────────────────────

/**
 * getPasswordStrength — returns a score 0-4 and a label for the password.
 * Used to show the strength bar UI below the password field.
 *
 * @param {string} value
 * @returns {{ score: 0|1|2|3|4, label: string, color: string }}
 */
export function getPasswordStrength(value) {
  if (!value) return { score: 0, label: '', color: '' }

  let score = 0
  if (value.length >= PASSWORD_MIN_LENGTH)  score++
  if (value.length >= 12)                   score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/[0-9]/.test(value))                  score++
  if (/[^A-Za-z0-9]/.test(value))           score++ // special char bonus

  // Cap at 4
  const capped = Math.min(score, 4)

  const map = {
    0: { label: '',          color: '' },
    1: { label: 'Weak',      color: 'var(--danger)' },
    2: { label: 'Fair',      color: 'var(--warning)' },
    3: { label: 'Good',      color: 'var(--accent-sky)' },
    4: { label: 'Strong',    color: 'var(--success)' },
  }

  return { score: capped, ...map[capped] }
}

// ── Form-level validation ─────────────────────────────────────

/**
 * validateRegisterForm — validates the entire registration form at once.
 * Returns an object whose keys are field names and values are error strings.
 * Empty strings mean no error.
 *
 * @param {{ name: string, email: string, password: string, confirmPassword: string }} fields
 * @returns {Object.<string, string>}
 */
export function validateRegisterForm({ name, email, password, confirmPassword }) {
  return {
    name:            validateName(name),
    email:           validateEmail(email),
    password:        validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
  }
}

/**
 * hasErrors — checks if any field in a validation result has an error.
 * @param {Object.<string, string>} errors
 * @returns {boolean}
 */
export function hasErrors(errors) {
  return Object.values(errors).some((e) => e !== '')
}
