// src/utils/formatters.js
// ─────────────────────────────────────────────────────────────
// Pure formatting helpers used across the UI.
// ─────────────────────────────────────────────────────────────

/**
 * formatDate — formats an ISO date string to a readable format.
 * @param {string|Date} date
 * @param {'short'|'long'|'relative'} style
 * @returns {string}
 */
export function formatDate(date, style = 'short') {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'

  if (style === 'long') {
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * formatTime — formats seconds into MM:SS string (used for OTP countdown).
 * @param {number} seconds
 * @returns {string} e.g. "0:29"
 */
export function formatCountdown(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * maskEmail — partially hides an email for display.
 * e.g. "john.doe@gmail.com" → "jo***.doe@gmail.com"
 * @param {string} email
 * @returns {string}
 */
export function maskEmail(email) {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = local.slice(0, 2)
  const masked = '***'
  const rest = local.slice(-4)
  return `${visible}${masked}${rest}@${domain}`
}

/**
 * sessionLabel — readable label for an academic session in dropdowns.
 * HODs recognise a session by its name + academic year, never by its numeric id.
 * @param {{ name?: string, academicYear?: string, status?: string }} session
 * @returns {string} e.g. "2026-27 Odd Semester (2026-27) · active"
 */
export function sessionLabel(session) {
  if (!session) return ''
  const parts = [session.name]
  if (session.academicYear) parts.push(`(${session.academicYear})`)
  const base = parts.filter(Boolean).join(' ')
  return session.status ? `${base} · ${session.status}` : base
}

/**
 * roleLabel — turns the raw role enum into a readable label for the UI.
 * The JWT/login stores roles as lowercase enums ('hod', 'faculty', ...).
 * @param {string} role
 * @returns {string} e.g. 'hod' → 'Head of Department'
 */
export function roleLabel(role) {
  const map = {
    student: 'Student',
    faculty: 'Faculty',
    hod:     'Head of Department',
    admin:   'Administrator',
  }
  return map[role] ?? (role ? role[0].toUpperCase() + role.slice(1) : 'User')
}

/**
 * getInitials — returns 1-2 initials from a full name.
 * Used for avatar fallbacks.
 * @param {string} name
 * @returns {string} e.g. "John Doe" → "JD"
 */
export function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}