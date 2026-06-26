// src/components/ui/PageHeader.jsx
// ─────────────────────────────────────────────────────────────
// Standard page title + subtitle + right-side action slot.
// Used at the top of every dashboard page.
//
// Usage:
//   <PageHeader
//     title="Departments"
//     subtitle="Manage departments in your school"
//     action={<Button onClick={...}>+ New Department</Button>}
//   />
// ─────────────────────────────────────────────────────────────

/**
 * PageHeader
 *
 * @param {Object}          props
 * @param {string}          props.title
 * @param {string}          [props.subtitle]
 * @param {React.ReactNode} [props.action]   - Button(s) on the right side
 * @param {React.ReactNode} [props.breadcrumb] - Small text above the title
 */
export function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div
      style={{
        display:        'flex',
        alignItems:     'flex-start',
        justifyContent: 'space-between',
        marginBottom:    32,
        gap:             16,
        flexWrap:       'wrap',
      }}
    >
      <div>
        {/* Optional breadcrumb */}
        {breadcrumb && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>
            {breadcrumb}
          </p>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize:   '1.5rem',
            fontWeight:  700,
            color:      'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin:      0,
            lineHeight:  1.2,
          }}
        >
          {title}
        </h1>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize:  '0.875rem',
              color:     'var(--text-secondary)',
              marginTop:  6,
              margin:     0,
              marginTop:  4,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Right-side actions */}
      {action && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader
