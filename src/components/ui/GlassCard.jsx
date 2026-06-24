// src/components/ui/GlassCard.jsx
// ─────────────────────────────────────────────────────────────
// Two card variants used throughout the app:
//
//   <GlassCard>  — glassmorphism (sidebar, KPI tiles, modals, auth card)
//   <FlatCard>   — flat dark surface (forms, tables, detail pages)
//
// Usage:
//   <GlassCard className="p-6">...</GlassCard>
//   <FlatCard padding="20px">...</FlatCard>
// ─────────────────────────────────────────────────────────────

/**
 * GlassCard — frosted glass surface.
 * Use for: auth card, KPI cards, modals, notification panel, today's timetable slot.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.padding='24px']
 * @param {string} [props.borderRadius='var(--radius-xl)']
 * @param {Object} [props.style] - additional inline styles
 * @param {string} [props.className]
 */
export function GlassCard({
  children,
  padding      = '24px',
  borderRadius = 'var(--radius-xl)',
  style        = {},
  className    = '',
  ...rest
}) {
  return (
    <div
      className={className}
      style={{
        background:        'rgba(22, 27, 39, 0.75)',
        backdropFilter:    'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border:            '1px solid rgba(255,255,255,0.1)',
        boxShadow:         '0 20px 60px rgba(0,0,0,0.5)',
        borderRadius,
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

/**
 * FlatCard — flat dark surface, no blur.
 * Use for: forms, data tables, detail pages, list rows.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.padding='20px']
 * @param {string} [props.borderRadius='var(--radius-lg)']
 * @param {Object} [props.style]
 */
export function FlatCard({
  children,
  padding      = '20px',
  borderRadius = 'var(--radius-lg)',
  style        = {},
  className    = '',
  ...rest
}) {
  return (
    <div
      className={className}
      style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius,
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export default GlassCard
