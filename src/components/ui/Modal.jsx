// src/components/ui/Modal.jsx
// ─────────────────────────────────────────────────────────────
// Accessible modal dialog with:
//   - Fixed overlay (closes on backdrop click)
//   - ESC key to close
//   - Scroll lock on body while open
//   - Glass card design
//   - Title, content, optional footer slot
//
// Usage:
//   <Modal isOpen={open} onClose={() => setOpen(false)} title="Create Department">
//     <p>Modal content here</p>
//     <Modal.Footer>
//       <Button variant="ghost" onClick={onClose}>Cancel</Button>
//       <Button variant="primary">Confirm</Button>
//     </Modal.Footer>
//   </Modal>
// ─────────────────────────────────────────────────────────────

import { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

/**
 * Modal
 *
 * @param {Object}           props
 * @param {boolean}          props.isOpen     - Controls visibility
 * @param {Function}         props.onClose    - Called on backdrop/ESC/close btn
 * @param {string}           [props.title]    - Header title
 * @param {React.ReactNode}  props.children
 * @param {number}           [props.maxWidth] - Card max-width in px (default 480)
 * @param {boolean}          [props.closeOnBackdrop] - default true
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth          = 480,
  closeOnBackdrop   = true,
}) {
  // ── ESC key to close ──────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  // ── Body scroll lock ──────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden' // prevent background scroll

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  if (!isOpen) return null

  // ── Render into portal so modal is always on top ──────────
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position:       'fixed',
        inset:           0,
        zIndex:          1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '20px 16px',
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeOnBackdrop ? onClose : undefined}
        style={{
          position:   'absolute',
          inset:       0,
          background: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Glass card */}
      <div
        style={{
          position:          'relative',
          width:              '100%',
          maxWidth,
          maxHeight:          '90vh',
          display:           'flex',
          flexDirection:     'column',
          background:        'rgba(22, 27, 39, 0.92)',
          backdropFilter:    'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border:            '1px solid rgba(255,255,255,0.10)',
          boxShadow:         '0 24px 64px rgba(0,0,0,0.6)',
          borderRadius:      'var(--radius-xl)',
          animation:         'fadeIn 0.2s ease',
        }}
      >
        {/* ── Header ─────────────────────────────────────── */}
        {title && (
          <div
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:         '20px 24px 0',
              flexShrink:      0,
            }}
          >
            <h2
              style={{
                fontSize:   '1.05rem',
                fontWeight:  700,
                color:      'var(--text-primary)',
                margin:      0,
                fontFamily: 'var(--font-display)',
              }}
            >
              {title}
            </h2>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              style={{
                background: 'none',
                border:     'none',
                color:      'var(--text-muted)',
                cursor:     'pointer',
                padding:     6,
                display:    'flex',
                alignItems: 'center',
                borderRadius: 6,
                transition: 'color 0.15s, background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)'
                e.currentTarget.style.background = 'var(--bg-elevated)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)'
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <CloseIcon />
            </button>
          </div>
        )}

        {/* ── Content (scrollable) ────────────────────────── */}
        <div
          style={{
            padding:    '20px 24px',
            overflowY: 'auto',
            flex:       1,
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}

/**
 * Modal.Footer — sticky footer for action buttons.
 * Renders inside the glass card below scrollable content.
 */
Modal.Footer = function ModalFooter({ children }) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'flex-end',
        gap:             10,
        padding:        '0 24px 20px',
        flexShrink:      0,
        borderTop:      '1px solid var(--border-subtle)',
        paddingTop:      16,
        marginTop:       4,
      }}
    >
      {children}
    </div>
  )
}

export default Modal
