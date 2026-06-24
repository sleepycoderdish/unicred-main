// src/components/ui/Toast.jsx
// ─────────────────────────────────────────────────────────────
// Toast notification system.
// Renders a fixed stack in the top-right corner.
// Reads from ui.store — no props needed.
//
// Mount <ToastContainer /> once in App.jsx and call
// useUiStore().toastSuccess/Error/Warning/Info() anywhere.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from 'react'
import useUiStore from '@/store/ui.store'

// Icon per toast type
const ICONS = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
}

// Color scheme per toast type
const TYPE_STYLES = {
  success: { accent: 'var(--success)',  bg: 'var(--success-light)',  border: 'rgba(52, 211, 153, 0.25)' },
  error:   { accent: 'var(--danger)',   bg: 'var(--danger-light)',   border: 'rgba(248, 113, 113, 0.25)' },
  warning: { accent: 'var(--warning)',  bg: 'var(--warning-light)',  border: 'rgba(251, 191, 36, 0.25)' },
  info:    { accent: 'var(--accent-sky)', bg: 'var(--accent-sky-light)', border: 'rgba(56, 189, 248, 0.25)' },
}

/**
 * ToastItem — a single notification card.
 * Auto-dismisses itself after props.duration ms.
 */
function ToastItem({ id, type, message, duration }) {
  const removeToast = useUiStore((s) => s.removeToast)
  const timerRef    = useRef(null)
  const styles      = TYPE_STYLES[type] || TYPE_STYLES.info

  useEffect(() => {
    // Start auto-dismiss timer
    timerRef.current = setTimeout(() => removeToast(id), duration)

    // Clear timer if component unmounts early (e.g. manual dismiss)
    return () => clearTimeout(timerRef.current)
  }, [id, duration, removeToast])

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display:       'flex',
        alignItems:    'flex-start',
        gap:            12,
        padding:        '14px 16px',
        borderRadius:  'var(--radius-md)',
        background:    'var(--bg-elevated)',
        border:        `1px solid ${styles.border}`,
        boxShadow:     '0 8px 24px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(12px)',
        minWidth:       280,
        maxWidth:       380,
        animation:      'slideIn 0.25s ease forwards',
        position:       'relative',
        overflow:       'hidden',
      }}
    >
      {/* Colour accent bar on left */}
      <div
        style={{
          position:     'absolute',
          left:          0,
          top:           0,
          bottom:        0,
          width:         3,
          background:   styles.accent,
          borderRadius: '4px 0 0 4px',
        }}
      />

      {/* Icon */}
      <span style={{ color: styles.accent, flexShrink: 0, marginTop: 1 }}>
        {ICONS[type]}
      </span>

      {/* Message */}
      <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', flex: 1, margin: 0, lineHeight: 1.5 }}>
        {message}
      </p>

      {/* Close button */}
      <button
        onClick={() => removeToast(id)}
        aria-label="Dismiss notification"
        style={{
          background: 'none',
          border:     'none',
          padding:    2,
          cursor:     'pointer',
          color:      'var(--text-muted)',
          flexShrink: 0,
          display:    'flex',
          alignItems: 'center',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Auto-dismiss progress bar */}
      <div
        style={{
          position:   'absolute',
          bottom:      0,
          left:        0,
          right:       0,
          height:      2,
          background: styles.accent,
          opacity:     0.4,
          animation:  `shrink ${duration}ms linear forwards`,
          transformOrigin: 'left',
        }}
      />

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  )
}

/**
 * ToastContainer — mount once in App.jsx.
 * Reads from ui.store and renders all queued toasts.
 */
export function ToastContainer() {
  const toasts = useUiStore((s) => s.toasts)

  return (
    <div
      aria-label="Notifications"
      style={{
        position:   'fixed',
        top:         20,
        right:       20,
        zIndex:      10000,
        display:     'flex',
        flexDirection: 'column',
        gap:          10,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
