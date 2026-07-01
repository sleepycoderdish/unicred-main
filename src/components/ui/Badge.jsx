// src/components/ui/Badge.jsx
// ─────────────────────────────────────────────────────────────
// Coloured pill badge for roles, statuses, and designations.
//
// Usage:
//   <Badge type="role" value="hod" />         → "HOD" in sky blue
//   <Badge type="role" value="faculty" />      → "Faculty" in green
//   <Badge type="status" value="active" />     → "Active" in green
//   <Badge label="Professor" color="accent" /> → custom label
// ─────────────────────────────────────────────────────────────

// ── Role colour map ───────────────────────────────────────────
const ROLE_STYLES = {
  student: { label: 'Student',  bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
  faculty: { label: 'Faculty',  bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  hod:     { label: 'HOD',      bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  admin:   { label: 'Admin',    bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
}

// ── Status colour map ─────────────────────────────────────────
const STATUS_STYLES = {
  active:    { label: 'Active',    bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  inactive:  { label: 'Inactive',  bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  verified:  { label: 'Verified',  bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  unverified:{ label: 'Unverified',bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  assigned:  { label: 'Assigned',  bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  unassigned:{ label: 'Unassigned',bg: 'rgba(71,85,105,0.2)',    color: '#94a3b8', border: 'rgba(71,85,105,0.3)' },
  // Achievement / review verdict statuses
  pending:   { label: 'Pending',   bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  approved:  { label: 'Approved',  bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  rejected:  { label: 'Rejected',  bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
}

// ── Preset colour shortcuts ───────────────────────────────────
const COLOR_MAP = {
  accent:  { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8', border: 'rgba(99,102,241,0.25)' },
  sky:     { bg: 'rgba(56,189,248,0.12)',  color: '#38bdf8', border: 'rgba(56,189,248,0.25)' },
  success: { bg: 'rgba(52,211,153,0.12)',  color: '#34d399', border: 'rgba(52,211,153,0.25)' },
  warning: { bg: 'rgba(251,191,36,0.12)',  color: '#fbbf24', border: 'rgba(251,191,36,0.25)' },
  danger:  { bg: 'rgba(248,113,113,0.12)', color: '#f87171', border: 'rgba(248,113,113,0.25)' },
  muted:   { bg: 'rgba(71,85,105,0.2)',    color: '#94a3b8', border: 'rgba(71,85,105,0.3)' },
}

/**
 * Badge
 *
 * Two usage modes:
 *   1. Semantic: <Badge type="role" value="hod" />
 *      type can be "role" | "status"
 *      value is a key in ROLE_STYLES or STATUS_STYLES
 *
 *   2. Custom:  <Badge label="Professor" color="accent" />
 *      label is any string, color is a key in COLOR_MAP
 *
 * @param {Object}  props
 * @param {'role'|'status'} [props.type]
 * @param {string}  [props.value]  - key in the relevant style map
 * @param {string}  [props.label]  - override/custom label
 * @param {string}  [props.color]  - key in COLOR_MAP for custom badges
 */
export function Badge({ type, value, label, color = 'muted' }) {
  let styles
  let displayLabel = label

  if (type === 'role' && value) {
    styles       = ROLE_STYLES[value.toLowerCase()] || COLOR_MAP.muted
    displayLabel = label || styles.label
  } else if (type === 'status' && value) {
    styles       = STATUS_STYLES[value.toLowerCase()] || COLOR_MAP.muted
    displayLabel = label || styles.label
  } else {
    // Custom badge with explicit label + color
    styles       = COLOR_MAP[color] || COLOR_MAP.muted
    displayLabel = label || value || '—'
  }

  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        padding:      '3px 10px',
        borderRadius:  99,
        fontSize:     '0.72rem',
        fontWeight:    600,
        letterSpacing: '0.02em',
        background:   styles.bg,
        color:        styles.color,
        border:       `1px solid ${styles.border}`,
        whiteSpace:   'nowrap',
      }}
    >
      {displayLabel}
    </span>
  )
}

export default Badge
