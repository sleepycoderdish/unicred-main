// src/components/ui/Button.jsx
// ─────────────────────────────────────────────────────────────
// Reusable button with variants, loading state, and icon slots.
//
// Variants:
//   primary   — filled indigo, used for primary CTAs
//   secondary — outlined, used for secondary actions
//   ghost     — no border, used for tertiary/nav actions
//   danger    — red, used for destructive actions
//
// Usage:
//   <Button variant="primary" loading={isLoading} fullWidth>Sign In</Button>
//   <Button variant="ghost" icon={<LogOutIcon />}>Logout</Button>
// ─────────────────────────────────────────────────────────────

import { Spinner } from '@/components/ui/Loader'

// Style maps for each variant
const VARIANT_STYLES = {
  primary: {
    background:  'var(--accent)',
    color:       '#fff',
    border:      'none',
    boxShadow:   '0 0 20px rgba(99, 102, 241, 0.25)',
    '--hover-bg': 'var(--accent-hover)',
  },
  secondary: {
    background:  'transparent',
    color:       'var(--text-primary)',
    border:      '1px solid var(--border-strong)',
    '--hover-bg': 'var(--bg-elevated)',
  },
  ghost: {
    background:  'transparent',
    color:       'var(--text-secondary)',
    border:      '1px solid transparent',
    '--hover-bg': 'var(--bg-elevated)',
  },
  danger: {
    background:  'var(--danger-light)',
    color:       'var(--danger)',
    border:      '1px solid rgba(248, 113, 113, 0.3)',
    '--hover-bg': 'rgba(248, 113, 113, 0.2)',
  },
  accent: {
    background:  'var(--accent-light)',
    color:       'var(--text-accent)',
    border:      '1px solid var(--accent-border)',
    '--hover-bg': 'rgba(99, 102, 241, 0.2)',
  },
}

const SIZE_STYLES = {
  sm: { fontSize: '0.8rem',   padding: '0.45rem 0.85rem', borderRadius: 'var(--radius-sm)' },
  md: { fontSize: '0.875rem', padding: '0.65rem 1.2rem',  borderRadius: 'var(--radius-sm)' },
  lg: { fontSize: '0.95rem',  padding: '0.8rem 1.5rem',   borderRadius: 'var(--radius-md)' },
}

/**
 * Button
 *
 * @param {Object} props
 * @param {'primary'|'secondary'|'ghost'|'danger'|'accent'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.loading=false]      - Shows spinner and disables button
 * @param {string}  [props.loadingText]        - Text shown while loading
 * @param {boolean} [props.fullWidth=false]    - Stretches to container width
 * @param {boolean} [props.disabled=false]
 * @param {React.ReactNode} [props.icon]       - Icon node shown before label
 * @param {React.ReactNode} [props.iconRight]  - Icon node shown after label
 * @param {React.ReactNode} props.children
 * @param {Function} [props.onClick]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 */
export function Button({
  variant     = 'primary',
  size        = 'md',
  loading     = false,
  loadingText = 'Please wait...',
  fullWidth   = false,
  disabled    = false,
  icon,
  iconRight,
  children,
  onClick,
  type        = 'button',
  style       = {},
  ...rest
}) {
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary
  const sizeStyle    = SIZE_STYLES[size] || SIZE_STYLES.md
  const isDisabled   = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:             8,
        fontFamily:     'var(--font-sans)',
        fontWeight:     600,
        cursor:         isDisabled ? 'not-allowed' : 'pointer',
        opacity:        isDisabled ? 0.55 : 1,
        width:          fullWidth ? '100%' : 'auto',
        transition:     'background 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease, opacity 0.15s',
        whiteSpace:     'nowrap',
        userSelect:     'none',
        ...variantStyle,
        ...sizeStyle,
        ...style,
      }}
      onMouseEnter={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = variantStyle['--hover-bg'] || variantStyle.background
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 0 28px rgba(99, 102, 241, 0.4)'
          }
        }
      }}
      onMouseLeave={(e) => {
        if (!isDisabled) {
          e.currentTarget.style.background = variantStyle.background
          if (variant === 'primary') {
            e.currentTarget.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.25)'
          }
        }
      }}
      onMouseDown={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = 'scale(0.97)'
      }}
      onMouseUp={(e) => {
        if (!isDisabled) e.currentTarget.style.transform = 'scale(1)'
      }}
      {...rest}
    >
      {/* Loading spinner replaces icon when loading */}
      {loading ? (
        <>
          <Spinner size={size === 'sm' ? 14 : 16} />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          {children}
          {iconRight && <span style={{ display: 'flex', alignItems: 'center' }}>{iconRight}</span>}
        </>
      )}
    </button>
  )
}

export default Button
