// src/components/ui/Select.jsx
// ─────────────────────────────────────────────────────────────
// Styled native <select> element.
// Uses the native select for accessibility (keyboard nav, screen readers)
// but styles it to match the Unicred design system.
//
// Usage:
//   <Select
//     label="Filter by department"
//     value={deptId}
//     onChange={e => setDeptId(e.target.value)}
//     options={[
//       { value: '', label: 'All departments' },
//       { value: '30001', label: 'Electrical Engineering' },
//     ]}
//   />
// ─────────────────────────────────────────────────────────────

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: 'none' }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

/**
 * Select
 *
 * @param {Object}    props
 * @param {string}    [props.label]     - Label shown above the select
 * @param {boolean}   [props.required]
 * @param {string}    [props.error]     - Error message below
 * @param {string}    [props.hint]      - Helper text below
 * @param {Array}     props.options     - [{ value: string, label: string }]
 * @param {string}    props.value       - Controlled value
 * @param {Function}  props.onChange    - e => void
 * @param {boolean}   [props.disabled]
 * @param {string}    [props.placeholder] - First empty option label
 */
export function Select({
  label,
  required,
  error,
  hint,
  options     = [],
  value,
  onChange,
  disabled,
  placeholder = 'Select an option',
  style       = {},
  id,
  ...rest
}) {
  const inputId  = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
  const hasError = !!error

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%', ...style }}>

      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)' }}
        >
          {label}
          {required && <span style={{ color: 'var(--danger)', marginLeft: 3 }}>*</span>}
        </label>
      )}

      {/* Wrapper holds select + chevron icon */}
      <div style={{ position: 'relative' }}>
        <select
          id={inputId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width:          '100%',
            appearance:     'none',
            WebkitAppearance: 'none',
            background:     'var(--bg-input)',
            border:         `1px solid ${hasError ? 'var(--danger)' : 'var(--border-default)'}`,
            borderRadius:   'var(--radius-sm)',
            color:          value ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize:       '0.875rem',
            padding:        '0.625rem 2.25rem 0.625rem 0.875rem',
            outline:        'none',
            cursor:         disabled ? 'not-allowed' : 'pointer',
            opacity:        disabled ? 0.6 : 1,
            transition:     'border-color 0.15s ease, box-shadow 0.15s ease',
            boxShadow:      hasError ? '0 0 0 3px var(--danger-light)' : 'none',
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
        >
          {/* Placeholder option */}
          <option value="" disabled hidden>
            {placeholder}
          </option>

          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-primary)' }}
            >
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon — absolutely positioned inside the select */}
        <span
          style={{
            position:  'absolute',
            right:     12,
            top:       '50%',
            transform: 'translateY(-50%)',
            color:     'var(--text-muted)',
            display:   'flex',
            alignItems: 'center',
          }}
        >
          <ChevronIcon />
        </span>
      </div>

      {/* Error or hint */}
      {(error || hint) && (
        <p style={{ fontSize: '0.75rem', color: error ? 'var(--danger)' : 'var(--text-muted)', margin: 0 }}>
          {error || hint}
        </p>
      )}
    </div>
  )
}

export default Select
