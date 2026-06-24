// src/pages/auth/ForgotPassword.jsx
// ─────────────────────────────────────────────────────────────
// Forgot password — Step 1: collect email and send reset OTP.
//
// Flow:
//   1. User enters their registered email
//   2. POST /api/auth/forgot-password { email }
//   3. On success → navigate to /auth/reset-password with email in state
//   4. On failure → show error (e.g. "Email not registered")
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthLayout } from '@/layouts/AuthLayout'
import { Input }      from '@/components/ui/Input'
import { Button }     from '@/components/ui/Button'
import { useAuth }    from '@/hooks/useAuth'
import { validateEmail } from '@/utils/validators'
import { ROUTES } from '@/config/constants'

const MailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>
  </svg>
)

export default function ForgotPassword() {
  const [email,      setEmail]      = useState('')
  const [emailError, setEmailError] = useState('')

  const { forgotPassword, loading, error: apiError, clearError } = useAuth()

  function handleChange(e) {
    setEmail(e.target.value)
    if (emailError) setEmailError('')
    clearError()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    clearError()

    const err = validateEmail(email)
    if (err) {
      setEmailError(err)
      return
    }

    await forgotPassword(email)
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your registered email to receive a reset code"
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

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <Input
            label="Registered email"
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="you@university.edu"
            error={emailError}
            icon={<MailIcon />}
            required
            autoFocus
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Sending code..."
          >
            Send reset code
          </Button>
        </div>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 24 }}>
        Remember your password?{' '}
        <Link
          to={ROUTES.LOGIN}
          style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
