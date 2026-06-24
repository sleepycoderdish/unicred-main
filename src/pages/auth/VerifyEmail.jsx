// src/pages/auth/VerifyEmail.jsx
// ─────────────────────────────────────────────────────────────
// Email verification page.
//
// This page is shown in TWO different situations — the behaviour
// differs based on location.state.source:
//
//   source === 'register'  (came from just signing up)
//     → Auto-sends OTP on mount immediately.
//       User just created their account and expects the code right away.
//
//   source === 'login'  (came from login attempt, email not verified)
//     → Does NOT auto-send on mount.
//       The user may already have a valid OTP in their inbox from
//       a previous register attempt. We show a "Send code" button
//       and let them decide.
//
// Verified users never reach this page — useAuth().login() only
// redirects here when the backend returns 403 EMAIL_NOT_VERIFIED.
// Every other successful login goes straight to the dashboard.
// ─────────────────────────────────────────────────────────────


import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import { OtpInput }   from '@/components/ui/OtpInput'
import { Button }     from '@/components/ui/Button'
import { useAuth }    from '@/hooks/useAuth'
import { validateOtp } from '@/utils/validators'
import { maskEmail, formatCountdown } from '@/utils/formatters'
import { ROUTES, OTP_RESEND_SECONDS } from '@/config/constants'

export default function VerifyEmail() {
  const location = useLocation()

  // Get email from navigation state or query params
  const email =
    location.state?.email ||
    new URLSearchParams(location.search).get('email') ||
    ''

  // OTP value (6-character string)
  const [otp,       setOtp]       = useState('')
  const [otpError,  setOtpError]  = useState('')
  const [countdown, setCountdown] = useState(OTP_RESEND_SECONDS)
  const [hasSent,   setHasSent]   = useState(false) // Have we sent the first OTP?

  const timerRef = useRef(null)

  const { sendOtp, verifyOtp, loading, error: apiError, clearError } = useAuth()

  // ── Send OTP on mount ──────────────────────────────────────
  useEffect(() => {
    if (email && !hasSent) {
      handleSendOtp()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Countdown timer ────────────────────────────────────────
  /**
   * startCountdown — resets and starts the 30-second resend timer.
   * Called after each OTP send.
   */
  function startCountdown() {
    clearInterval(timerRef.current)
    setCountdown(OTP_RESEND_SECONDS)

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => clearInterval(timerRef.current)
  }, [])

  // ── Handlers ──────────────────────────────────────────────

  /**
   * handleSendOtp — sends or resends the OTP.
   */
  async function handleSendOtp() {
    if (!email) return
    clearError()
    const success = await sendOtp(email)
    if (success) {
      setHasSent(true)
      startCountdown()
    }
  }

  /**
   * handleVerify — submits the entered OTP.
   */
  async function handleVerify(e) {
    e.preventDefault()
    clearError()

    const err = validateOtp(otp)
    if (err) {
      setOtpError(err)
      return
    }

    await verifyOtp(email, otp)
  }

  function handleOtpChange(value) {
    setOtp(value)
    if (otpError) setOtpError('')
    clearError()
  }

  // ── No email edge case ─────────────────────────────────────
  if (!email) {
    return (
      <AuthLayout title="Verify your email">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 20 }}>
            We couldn't find your email address. Please register again.
          </p>
          <Button variant="primary" fullWidth onClick={() => window.location.href = ROUTES.REGISTER}>
            Back to registration
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${maskEmail(email)}`}
    >
      {/* API error */}
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

      <form onSubmit={handleVerify} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* OTP boxes */}
          <OtpInput
            value={otp}
            onChange={handleOtpChange}
            error={otpError}
            disabled={loading}
          />

          {/* Resend section */}
          <div style={{ textAlign: 'center' }}>
            {countdown > 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Resend code in{' '}
                <span style={{ color: 'var(--text-accent)', fontWeight: 600 }}>
                  {formatCountdown(countdown)}
                </span>
              </p>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                style={{
                  background: 'none',
                  border:     'none',
                  color:      'var(--accent-sky)',
                  fontSize:   '0.8rem',
                  fontWeight:  600,
                  cursor:     loading ? 'not-allowed' : 'pointer',
                  padding:    0,
                  opacity:    loading ? 0.6 : 1,
                }}
              >
                Resend code
              </button>
            )}
          </div>

          {/* Verify button */}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Verifying..."
            disabled={otp.length < 6}
          >
            Verify email
          </Button>

          {/* Hint */}
          <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            Check your spam folder if you don't see the email.
            The code expires in 10 minutes.
          </p>
        </div>
      </form>

      {/* Back to login */}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 20 }}>
        Wrong email?{' '}
        <Link
          to={ROUTES.REGISTER}
          style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Register again
        </Link>
      </p>
    </AuthLayout>
  )
}
