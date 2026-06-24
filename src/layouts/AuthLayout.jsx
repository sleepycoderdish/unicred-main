// src/layouts/AuthLayout.jsx
// ─────────────────────────────────────────────────────────────
// Layout wrapper for all auth pages (Login, Register, Verify, etc.)
//
// Renders:
//   - Full-screen dark background with two gradient mesh blobs
//   - Centred glass card with the Unicred logo at top
//   - Responsive: full-width card on mobile, fixed-width on desktop
//
// Usage (automatically applied by router.jsx — no manual wrapping needed):
//   <AuthLayout title="Create account" subtitle="Start your journey with Unicred">
//     <RegisterForm />
//   </AuthLayout>
// ─────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { APP_NAME, ROUTES } from '@/config/constants'

/**
 * AuthLayout
 *
 * @param {Object} props
 * @param {string}           [props.title]    - Heading inside the card (e.g. "Welcome back")
 * @param {string}           [props.subtitle] - Subheading (e.g. "Sign in to continue")
 * @param {React.ReactNode}  props.children   - Form content
 * @param {number}           [props.maxWidth] - Card max-width in px (default: 420)
 */
export function AuthLayout({ title, subtitle, children, maxWidth = 420 }) {
  return (
    <div
      style={{
        minHeight:       '100vh',
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        padding:         '24px 16px',
        position:        'relative',
        backgroundColor: 'var(--bg-base)',
        overflow:        'hidden',
      }}
    >
      {/* ── Gradient mesh blobs (CSS background art) ──────── */}
      {/* Top-left indigo blob */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          top:          -120,
          left:         -100,
          width:         500,
          height:        500,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)',
          filter:       'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      {/* Bottom-right sky blue blob */}
      <div
        aria-hidden="true"
        style={{
          position:     'absolute',
          bottom:       -80,
          right:        -80,
          width:         400,
          height:        400,
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(56,189,248,0.25) 0%, transparent 70%)',
          filter:       'blur(60px)',
          pointerEvents: 'none',
        }}
      />

      {/* ── Glass card ─────────────────────────────────────── */}
      <div
        style={{
          width:             '100%',
          maxWidth,
          background:        'rgba(22, 27, 39, 0.80)',
          backdropFilter:    'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border:            '1px solid rgba(255,255,255,0.10)',
          boxShadow:         '0 24px 64px rgba(0,0,0,0.55)',
          borderRadius:      'var(--radius-xl)',
          padding:           '36px 32px',
          animation:         'fadeIn 0.4s ease',
          position:          'relative',
          zIndex:            1,
        }}
      >
        {/* ── Logo + brand ────────────────────────────────── */}
        <Link
          to={ROUTES.LANDING}
          style={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            gap:             8,
            marginBottom:   28,
            textDecoration: 'none',
          }}
        >
          <img
            src="/unicred-logo.png"
            alt={APP_NAME}
            style={{
              width:  72,
              height: 72,
              objectFit: 'contain',
              // Boost visibility on dark background + add indigo glow
              filter: 'drop-shadow(0 0 14px rgba(99, 102, 241, 0.45)) brightness(1.15)',
            }}
          />
          <span
            style={{
              fontSize:      '1.15rem',
              fontWeight:    700,
              fontFamily:    'var(--font-display)',
              color:         'var(--text-primary)',
              letterSpacing: '0.01em',
            }}
          >
            {APP_NAME}
          </span>
        </Link>

        {/* ── Heading ─────────────────────────────────────── */}
        {(title || subtitle) && (
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            {title && (
              <h1
                style={{
                  fontSize:     '1.35rem',
                  fontWeight:   700,
                  color:        'var(--text-primary)',
                  marginBottom:  subtitle ? 6 : 0,
                  fontFamily:   'var(--font-display)',
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color:    'var(--text-secondary)',
                  margin:    0,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* ── Page content ────────────────────────────────── */}
        {children}
      </div>

      {/* ── Footer note ─────────────────────────────────────── */}
      <p
        style={{
          marginTop: 20,
          fontSize:  '0.75rem',
          color:     'var(--text-muted)',
          textAlign: 'center',
          position:  'relative',
          zIndex:    1,
        }}
      >
        © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  )
}

export default AuthLayout
