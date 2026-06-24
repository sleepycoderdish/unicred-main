// src/components/ui/Loader.jsx
// ─────────────────────────────────────────────────────────────
// Reusable loading components.
//
// Exports:
//   <Spinner />       — Inline SVG spinner (inside buttons, next to text)
//   <PageLoader />    — Full-screen overlay (initial auth check)
//   <CardLoader />    — Skeleton placeholder for a card
//   <TableLoader />   — Skeleton placeholder for a table
//
// Usage:
//   import { Spinner, PageLoader, CardLoader, TableLoader } from '@/components/ui/Loader'
// ─────────────────────────────────────────────────────────────

// ── Spinner ──────────────────────────────────────────────────

/**
 * Spinner — inline spinning circle.
 * Matches the color of its surrounding text by using currentColor.
 *
 * @param {{ size?: number, className?: string }} props
 *   size      - diameter in px (default: 20)
 *   className - extra CSS classes
 */
export function Spinner({ size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ animation: 'spin 0.7s linear infinite' }}
      aria-label="Loading"
      role="status"
    >
      {/* Background track */}
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        opacity="0.2"
      />
      {/* Spinning arc */}
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

// ── PageLoader ───────────────────────────────────────────────

/**
 * PageLoader — full-screen centered loading state.
 * Used during the initial auth-check on app mount (before we know
 * if the user is logged in). Shown while ProtectedRoute is resolving.
 *
 * @param {{ message?: string }} props
 */
export function PageLoader({ message = 'Loading Unicred...' }) {
  return (
    <div
      style={{
        position:        'fixed',
        inset:           0,
        display:         'flex',
        flexDirection:   'column',
        alignItems:      'center',
        justifyContent:  'center',
        gap:             '16px',
        backgroundColor: 'var(--bg-base)',
        zIndex:          9999,
      }}
    >
      {/* Unicred logo */}
      <img
        src="/unicred-logo.png"
        alt="Unicred"
        style={{
          width:  64,
          height: 64,
          filter: 'drop-shadow(0 0 16px rgba(99, 102, 241, 0.5))',
          animation: 'fadeIn 0.5s ease',
        }}
      />

      {/* Pulsing rings */}
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        {/* Outer pulse ring */}
        <div
          style={{
            position:     'absolute',
            inset:        0,
            borderRadius: '50%',
            border:       '2px solid var(--accent)',
            animation:    'pulse-ring 1.2s ease-out infinite',
          }}
        />
        {/* Inner spinner */}
        <div
          style={{
            position:       'absolute',
            inset:          4,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}
        >
          <Spinner size={32} style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      {/* Loading message */}
      <p
        style={{
          fontSize:   '0.8rem',
          color:      'var(--text-muted)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {message}
      </p>
    </div>
  )
}

// ── CardLoader ───────────────────────────────────────────────

/**
 * CardLoader — skeleton shimmer for a single card.
 * Use as a placeholder while data is loading.
 *
 * @param {{ lines?: number }} props
 *   lines - number of text line skeletons (default: 3)
 */
export function CardLoader({ lines = 3 }) {
  return (
    <div
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding:      '20px',
      }}
    >
      {/* Title skeleton */}
      <div
        className="skeleton"
        style={{ height: 16, width: '55%', borderRadius: 6, marginBottom: 16 }}
      />
      {/* Line skeletons */}
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            height:       12,
            width:        i === lines - 1 ? '40%' : '100%',
            borderRadius: 4,
            marginBottom: 10,
          }}
        />
      ))}
    </div>
  )
}

// ── TableLoader ──────────────────────────────────────────────

/**
 * TableLoader — skeleton shimmer for a table.
 *
 * @param {{ rows?: number, cols?: number }} props
 */
export function TableLoader({ rows = 5, cols = 4 }) {
  return (
    <div
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow:     'hidden',
      }}
    >
      {/* Header row */}
      <div
        style={{
          display:         'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap:             16,
          padding:         '12px 20px',
          borderBottom:    '1px solid var(--border-subtle)',
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ height: 12, borderRadius: 4 }}
          />
        ))}
      </div>

      {/* Data rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          style={{
            display:         'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap:             16,
            padding:         '16px 20px',
            borderBottom:    row < rows - 1 ? '1px solid var(--border-subtle)' : 'none',
          }}
        >
          {Array.from({ length: cols }).map((_, col) => (
            <div
              key={col}
              className="skeleton"
              style={{
                height:       10,
                width:        col === 0 ? '70%' : col === cols - 1 ? '40%' : '85%',
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── ButtonLoader ─────────────────────────────────────────────

/**
 * ButtonLoader — renders either children or a spinner+label in a button.
 * Use inside Button component to toggle between normal and loading state.
 *
 * @param {{ loading: boolean, children: React.ReactNode, loadingText?: string }} props
 */
export function ButtonLoader({ loading, children, loadingText = 'Please wait...' }) {
  if (!loading) return children

  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
      <Spinner size={16} />
      <span>{loadingText}</span>
    </span>
  )
}
