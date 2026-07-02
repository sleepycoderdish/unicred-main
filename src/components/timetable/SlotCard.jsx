// src/components/timetable/SlotCard.jsx
// ─────────────────────────────────────────────────────────────
// Component: SlotCard
// Renders: a single class slot inside one WeeklyGrid cell — subject
//          name, faculty name, classroom, and a slotType badge.
//          Color-coded by slotType: lecture=blue, lab=green, tutorial=amber.
// Props:
//   slot: {
//     subject:  { name: string },
//     faculty:  { user: { name: string } },
//     classroom: string,
//     slotType:  'lecture' | 'lab' | 'tutorial',
//     startTime: string,
//     endTime:   string,
//   }
// ─────────────────────────────────────────────────────────────

// Color scheme per slotType — background/border/text kept in one place
// so WeeklyGrid and SlotCard always agree on the same palette.
const SLOT_TYPE_STYLES = {
  lecture:  { bg: 'rgba(56,189,248,0.10)',  border: 'rgba(56,189,248,0.35)',  color: '#38bdf8' },
  lab:      { bg: 'rgba(52,211,153,0.10)',  border: 'rgba(52,211,153,0.35)',  color: '#34d399' },
  tutorial: { bg: 'rgba(251,191,36,0.10)',  border: 'rgba(251,191,36,0.35)',  color: '#fbbf24' },
}

/**
 * SlotCard — renders one class slot as a small colored card.
 * Params: props.slot — the slot object described above
 * Returns: JSX, or null if no slot was passed (blank grid cell)
 */
export function SlotCard({ slot }) {
  if (!slot) return null

  const styles = SLOT_TYPE_STYLES[slot.slotType] || SLOT_TYPE_STYLES.lecture
  const facultyName = slot.faculty?.user?.name || slot.faculty?.name
  const subjectName = slot.subject?.name || slot.subject?.courseCode

  return (
    <div
      style={{
        background:   styles.bg,
        border:       `1px solid ${styles.border}`,
        borderRadius: 'var(--radius-sm, 8px)',
        padding:      '8px 10px',
        display:      'flex',
        flexDirection: 'column',
        gap:          4,
        minWidth:     140,
      }}
    >
      <span
        style={{
          fontSize:      '0.68rem',
          fontWeight:    700,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          color:         styles.color,
        }}
      >
        {slot.slotType}
      </span>
      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.25 }}>
        {subjectName}
      </p>
      {facultyName && (
        <p style={{ margin: 0, fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{facultyName}</p>
      )}
      {slot.classroom && (
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{slot.classroom}</p>
      )}
    </div>
  )
}

export default SlotCard
