// src/pages/auth/Login.jsx
// ─────────────────────────────────────────────────────────────
// Login page — email + password form.
//
// Flow:
//   1. User enters email + password
//   2. Frontend validates (non-empty, email format, password non-empty)
//   3. Calls useAuth().login()
//   4. On success: accessToken stored, redirect to role dashboard
//   5. On failure: error message shown below form
//
// Edge cases handled:
//   - "session_expired" query param → shows contextual message
//   - After login, redirects to the page the user was originally trying to visit
//     (stored in location.state.from by ProtectedRoute)
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { AuthLayout }  from '@/layouts/AuthLayout'
import { Input }       from '@/components/ui/Input'
import { Button }      from '@/components/ui/Button'
import { useAuth }     from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validators'
import { ROUTES }      from '@/config/constants'

// SVG icons (inline — avoids icon library dependency)
const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>
  </svg>
)

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

export default function Login() {
  const navigate  = useNavigate()
  const location  = useLocation()

  // Detect session expiry redirect from ProtectedRoute / Axios interceptor
  const params        = new URLSearchParams(location.search)
  const sessionExpired = params.get('reason') === 'session_expired'

  // If the user was redirected from a protected page, go back there after login
  const from = location.state?.from?.pathname || null

  // Form state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  // Field-level validation errors
  const [errors, setErrors] = useState({ email: '', password: '' })

  const { login, loading, error: apiError, clearError } = useAuth()

  // ── Validation ────────────────────────────────────────────

  /**
   * validate — validates the form before submission.
   * Returns true if all fields are valid.
   */
  function validate() {
    const newErrors = {
      email:    validateEmail(email),
      password: !password ? 'Password is required' : '',
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(Boolean)
  }

  // ── Submit ────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault()
    clearError() // Clear any previous API error

    if (!validate()) return

    await login({ email, password })

    // If login succeeded, redirect to intended page (if any)
    // The actual redirect happens inside useAuth().login() via getDashboardPath,
    // but if 'from' exists we override it here.
    if (from) navigate(from, { replace: true })
  }

  // Clear field error when user starts typing
  function handleEmailChange(e) {
    setEmail(e.target.value)
    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
    clearError()
  }

  function handlePasswordChange(e) {
    setPassword(e.target.value)
    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }))
    clearError()
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your Unicred account"
    >
      {/* ── Session expired banner ───────────────────────── */}
      {sessionExpired && (
        <div
          style={{
            background:   'var(--warning-light)',
            border:       '1px solid rgba(251,191,36,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding:      '10px 14px',
            marginBottom:  20,
            fontSize:     '0.8rem',
            color:        'var(--warning)',
            textAlign:    'center',
          }}
        >
          Your session expired. Please sign in again.
        </div>
      )}

      {/* ── API error banner ─────────────────────────────── */}
      {apiError && (
        <div
          style={{
            background:   'var(--danger-light)',
            border:       '1px solid rgba(248,113,113,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding:      '10px 14px',
            marginBottom:  20,
            fontSize:     '0.8rem',
            color:        'var(--danger)',
            textAlign:    'center',
          }}
        >
          {apiError}
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────── */}
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            placeholder="you@university.edu"
            error={errors.email}
            icon={<MailIcon />}
            required
            autoFocus
          />

          <div>
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              error={errors.password}
              icon={<LockIcon />}
              required
            />

            {/* Forgot password link */}
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                style={{
                  fontSize:       '0.78rem',
                  color:          'var(--accent-sky)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Signing in..."
            style={{ marginTop: 4 }}
          >
            Sign in
          </Button>
        </div>
      </form>

      {/* ── Register link ─────────────────────────────────── */}
      <p
        style={{
          textAlign: 'center',
          fontSize:  '0.8rem',
          color:     'var(--text-secondary)',
          marginTop:  24,
        }}
      >
        New student?{' '}
        <Link
          to={ROUTES.REGISTER}
          style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Create account
        </Link>
      </p>
    </AuthLayout>
  )
}
