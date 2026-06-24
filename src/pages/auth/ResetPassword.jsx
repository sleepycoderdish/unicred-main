// src/pages/auth/ResetPassword.jsx
// ─────────────────────────────────────────────────────────────
// Reset password — Step 2: enter OTP + new password.
//
// Flow:
//   1. Email is passed via location.state.email (from ForgotPassword)
//   2. User enters the OTP received in email + new password (twice)
//   3. POST /api/auth/reset-password { email, otp, newPassword }
//   4. On success → redirect to login with success toast
//   5. On failure → show inline error
//
// Note: otp is sent as string per the API proposal.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { AuthLayout }   from '@/layouts/AuthLayout'
import { OtpInput }     from '@/components/ui/OtpInput'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'
import { useAuth }      from '@/hooks/useAuth'
import {
  validatePassword,
  validateConfirmPassword,
  validateOtp,
  getPasswordStrength,
} from '@/utils/validators'
import { maskEmail } from '@/utils/formatters'
import { ROUTES } from '@/config/constants'

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
)

function PasswordStrengthBar({ score, label, color }) {
  if (!score) return null
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < score ? color : 'var(--border-default)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <p style={{ fontSize: '0.73rem', color, margin: 0 }}>{label}</p>
    </div>
  )
}

export default function ResetPassword() {
  const location = useLocation()
  const email    = location.state?.email || new URLSearchParams(location.search).get('email') || ''

  const [otp,             setOtp]             = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors,          setErrors]          = useState({})

  const { resetPassword, loading, error: apiError, clearError } = useAuth()

  const passwordStrength = getPasswordStrength(newPassword)

  function validate() {
    const e = {
      otp:             validateOtp(otp),
      newPassword:     validatePassword(newPassword),
      confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
    }
    setErrors(e)
    return !Object.values(e).some(Boolean)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()
    if (!validate()) return
    await resetPassword({ email, otp, newPassword })
  }

  // No email — send back to forgot password
  if (!email) {
    return (
      <AuthLayout title="Reset password">
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center', marginBottom: 20 }}>
          Session expired. Please start the password reset again.
        </p>
        <Button variant="primary" fullWidth onClick={() => window.location.href = ROUTES.FORGOT_PASSWORD}>
          Start over
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Set new password"
      subtitle={`Enter the code sent to ${maskEmail(email)}`}
    >
      {apiError && (
        <div style={{ background: 'var(--danger-light)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 20, fontSize: '0.8rem', color: 'var(--danger)', textAlign: 'center' }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* OTP */}
          <div>
            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 10, textAlign: 'center' }}>
              Verification code
            </p>
            <OtpInput
              value={otp}
              onChange={(v) => { setOtp(v); setErrors((p) => ({ ...p, otp: '' })); clearError() }}
              error={errors.otp}
              disabled={loading}
            />
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--border-subtle)' }} />

          {/* New password + strength */}
          <div>
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); clearError() }}
              placeholder="Min. 8 characters"
              error={errors.newPassword}
              icon={<LockIcon />}
              required
            />
            <PasswordStrengthBar {...passwordStrength} />
          </div>

          {/* Confirm password */}
          <Input
            label="Confirm new password"
            type="password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); clearError() }}
            placeholder="Re-enter new password"
            error={errors.confirmPassword}
            icon={<LockIcon />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Resetting password..."
            disabled={otp.length < 6}
          >
            Reset password
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 20 }}>
        Didn't get the code?{' '}
        <Link
          to={ROUTES.FORGOT_PASSWORD}
          style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Try again
        </Link>
      </p>
    </AuthLayout>
  )
}
