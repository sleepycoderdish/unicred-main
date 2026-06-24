// src/components/ui/Input.jsx
// ─────────────────────────────────────────────────────────────
// Reusable form input with:
//   - Label + optional required indicator
//   - Error message display
//   - Password visibility toggle
//   - Left icon slot
//   - Controlled (value + onChange) or uncontrolled
//
// Usage:
//   <Input
//     label="Email"
//     type="email"
//     value={email}
//     onChange={e => setEmail(e.target.value)}
//     error={errors.email}
//     placeholder="you@example.com"
//   />
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'

/**
 * EyeIcon — toggles password visibility.
 * @param {{ visible: boolean }} props
 */
function EyeIcon({ visible }) {
  return visible ? (
    // Eye-slash (hide password)
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    // Eye (show password)
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

/**
 * Input
 *
 * @param {Object} props
 * @param {string}  [props.label]        - Field label shown above input
 * @param {boolean} [props.required]     - Shows red asterisk after label
 * @param {string}  [props.error]        - Error message (red outline + message below)
 * @param {string}  [props.hint]         - Helper text below input (hidden when error shown)
 * @param {React.ReactNode} [props.icon] - Icon shown inside left side of input
 * @param {string}  props.type           - Input type (text, email, password, etc.)
 * @param {string}  props.value
 * @param {Function} props.onChange
 * @param {string}  [props.placeholder]
 * @param {boolean} [props.disabled]
 * @param {boolean} [props.autoFocus]
 * @param {string}  [props.id]           - Falls back to label-derived id
 * @param {string}  [props.name]
 */
export function Input({
  label,
  required,
  error,
  hint,
  icon,
  type     = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  autoFocus,
  id,
  name,
  style = {},
  ...rest
}) {
  // Internal toggle for password field visibility
  const [showPassword, setShowPassword] = useState(false)

  // Derived input type (toggle text/password when eye is clicked)
  const inputType = type === 'password'
    ? (showPassword ? 'text' : 'password')
    : type

  // Auto-generate id from label for accessibility (label htmlFor)
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  const hasError   = !!error
  const isPassword = type === 'password'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>

      {/* ── Label ──────────────────────────────────────────── */}
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize:    '0.8rem',
            fontWeight:  500,
            color:       'var(--text-secondary)',
            letterSpacing: '0.01em',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>
          )}
        </label>
      )}

      {/* ── Input wrapper (for icon and eye button) ─────────── */}
      <div style={{ position: 'relative' }}>

        {/* Left icon */}
        {icon && (
          <span
            style={{
              position:  'absolute',
              left:      12,
              top:       '50%',
              transform: 'translateY(-50%)',
              color:     'var(--text-muted)',
              display:   'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}

        {/* Input element */}
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete={
            type === 'password'    ? 'current-password' :
            type === 'email'       ? 'email' :
            name === 'name'        ? 'name' : undefined
          }
          style={{
            width:         '100%',
            background:    'var(--bg-input)',
            border:        `1px solid ${hasError ? 'var(--danger)' : 'var(--border-default)'}`,
            borderRadius:  'var(--radius-sm)',
            color:         'var(--text-primary)',
            fontSize:      '0.875rem',
            padding:       `0.625rem ${isPassword ? '2.75rem' : '0.875rem'} 0.625rem ${icon ? '2.5rem' : '0.875rem'}`,
            outline:       'none',
            transition:    'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow:     hasError ? '0 0 0 3px var(--danger-light)' : 'none',
            opacity:       disabled ? 0.6 : 1,
            cursor:        disabled ? 'not-allowed' : 'text',
          }}
          onFocus={(e) => {
            if (!hasError) {
              e.target.style.borderColor = 'var(--accent)'
              e.target.style.boxShadow   = '0 0 0 3px var(--accent-light)'
            }
          }}
          onBlur={(e) => {
            if (!hasError) {
              e.target.style.borderColor = 'var(--border-default)'
              e.target.style.boxShadow   = 'none'
            }
          }}
          {...rest}
        />

        {/* Password visibility toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((p) => !p)}
            tabIndex={-1} // Don't steal focus from input
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position:  'absolute',
              right:     12,
              top:       '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border:    'none',
              padding:   0,
              cursor:    'pointer',
              color:     'var(--text-muted)',
              display:   'flex',
              alignItems: 'center',
              transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <EyeIcon visible={showPassword} />
          </button>
        )}
      </div>

      {/* ── Error or hint ───────────────────────────────────── */}
      {(error || hint) && (
        <p
          style={{
            fontSize: '0.75rem',
            color:    error ? 'var(--danger)' : 'var(--text-muted)',
            margin:   0,
            lineHeight: 1.4,
          }}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}

export default Input
