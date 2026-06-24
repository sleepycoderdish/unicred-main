// src/pages/auth/Register.jsx
// ─────────────────────────────────────────────────────────────
// Student registration page.
//
// Flow:
//   1. User fills name, email, password, confirm password
//   2. Frontend validates all fields + password strength
//   3. POST /api/auth/register
//   4. On success → redirect to /auth/verify-email?email=...
//   5. On failure → show API error
//
// Note: Only students self-register.
//       Faculty/HOD/Admin accounts are created by admins.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'

import { AuthLayout }   from '@/layouts/AuthLayout'
import { Input }        from '@/components/ui/Input'
import { Button }       from '@/components/ui/Button'
import { useAuth }      from '@/hooks/useAuth'
import {
  validateRegisterForm,
  hasErrors,
  getPasswordStrength,
} from '@/utils/validators'
import { ROUTES } from '@/config/constants'

// Inline icons
const UserIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
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

/**
 * PasswordStrengthBar — visual indicator shown below password field.
 * Score 0-4 → 0-4 filled segments.
 *
 * @param {{ score: number, label: string, color: string }} props
 */
function PasswordStrengthBar({ score, label, color }) {
  if (!score) return null

  return (
    <div style={{ marginTop: 8 }}>
      {/* Four segment bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            style={{
              flex:         1,
              height:        4,
              borderRadius:  2,
              background:   i < score ? color : 'var(--border-default)',
              transition:   'background 0.3s ease',
            }}
          />
        ))}
      </div>
      {/* Label */}
      <p style={{ fontSize: '0.73rem', color, margin: 0 }}>{label}</p>
    </div>
  )
}

export default function Register() {
  const [form, setForm] = useState({
    name:            '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [errors,    setErrors]    = useState({})
  const [touched,   setTouched]   = useState({})  // Track which fields have been touched

  const { register, loading, error: apiError, clearError } = useAuth()

  // Live password strength (updates as user types)
  const passwordStrength = getPasswordStrength(form.password)

  // ── Handlers ──────────────────────────────────────────────

  /**
   * handleChange — updates a single field and re-validates that field.
   */
  function handleChange(field) {
    return (e) => {
      const value = e.target.value
      setForm((prev) => ({ ...prev, [field]: value }))
      clearError()

      // Real-time validation for touched fields
      if (touched[field]) {
        const allErrors = validateRegisterForm({ ...form, [field]: value })
        setErrors((prev) => ({ ...prev, [field]: allErrors[field] }))
      }
    }
  }

  /**
   * handleBlur — marks a field as touched and validates it.
   */
  function handleBlur(field) {
    return () => {
      setTouched((prev) => ({ ...prev, [field]: true }))
      const allErrors = validateRegisterForm(form)
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] }))
    }
  }

  /**
   * handleSubmit — validates all fields and calls register().
   */
  async function handleSubmit(e) {
    e.preventDefault()
    clearError()

    // Mark all fields as touched so errors show immediately
    setTouched({ name: true, email: true, password: true, confirmPassword: true })

    const allErrors = validateRegisterForm(form)
    setErrors(allErrors)

    if (hasErrors(allErrors)) return

    await register(form)
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Student registration — faculty accounts are created by your admin"
      maxWidth={440}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Full name */}
          <Input
            label="Full name"
            type="text"
            value={form.name}
            onChange={handleChange('name')}
            onBlur={handleBlur('name')}
            placeholder="e.g. Rahul Sharma"
            error={errors.name}
            icon={<UserIcon />}
            required
            autoFocus
          />

          {/* Email */}
          <Input
            label="Email address"
            type="email"
            value={form.email}
            onChange={handleChange('email')}
            onBlur={handleBlur('email')}
            placeholder="you@university.edu"
            error={errors.email}
            icon={<MailIcon />}
            required
          />

          {/* Password + strength bar */}
          <div>
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={handleChange('password')}
              onBlur={handleBlur('password')}
              placeholder="Min. 8 characters"
              error={errors.password}
              icon={<LockIcon />}
              required
            />
            <PasswordStrengthBar {...passwordStrength} />
          </div>

          {/* Confirm password */}
          <Input
            label="Confirm password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            onBlur={handleBlur('confirmPassword')}
            placeholder="Re-enter your password"
            error={errors.confirmPassword}
            icon={<LockIcon />}
            required
          />

          {/* Terms notice */}
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.5 }}>
            By creating an account you agree to Unicred's{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--text-secondary)' }}>Privacy Policy</span>.
          </p>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            loadingText="Creating account..."
          >
            Create account
          </Button>
        </div>
      </form>

      {/* Login link */}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 24 }}>
        Already have an account?{' '}
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
