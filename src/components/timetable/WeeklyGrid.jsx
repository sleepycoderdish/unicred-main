// src/components/timetable/WeeklyGrid.jsx
// ─────────────────────────────────────────────────────────────
// Component: WeeklyGrid
// Renders: a Mon-Sat x time-slot grid of classes. Rows are the
//          distinct start/end time ranges found in `slots`, sorted
//          by startTime. Columns are the six weekdays. Each cell
//          shows a SlotCard if a slot exists for that day+time, or
//          is left blank otherwise. Horizontally scrollable so it
//          stays usable on narrow/mobile screens.
// Props:
//   slots: Array<{
//     id, dayOfWeek: 1-6, startTime: 'HH:mm', endTime: 'HH:mm',
//     classroom, slotType, subject, faculty,
//   }>
//   emptyMessage?: string — shown when `slots` is empty (default provided)
// ─────────────────────────────────────────────────────────────

import { useMemo } from 'react'
import { SlotCard } from '@/components/timetable/SlotCard'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * buildRows — derives the sorted list of unique time ranges from the
 * slot list, so the grid only shows rows that are actually in use.
 * Params: slots: Array<Slot>
 * Returns: Array<{ startTime: string, endTime: string }> sorted by startTime
 */
function buildRows(slots) {
  const seen = new Map()
  for (const slot of slots) {
    const key = `${slot.startTime}-${slot.endTime}`
    if (!seen.has(key)) seen.set(key, { startTime: slot.startTime, endTime: slot.endTime })
  }
  // Array.from(map.values()) — pulls the unique {startTime,endTime} rows out of the Map.
  return Array.from(seen.values()).sort((a, b) => a.startTime.localeCompare(b.startTime))
}

/**
 * findSlot — looks up the slot (if any) for a given row + weekday.
 * Params: slots: Array<Slot>, row: { startTime, endTime }, dayOfWeek: number (1-6)
 * Returns: Slot | undefined
 */
function findSlot(slots, row, dayOfWeek) {
  return slots.find(
    (s) => s.dayOfWeek === dayOfWeek && s.startTime === row.startTime && s.endTime === row.endTime
  )
}

/**
 * WeeklyGrid — main grid component.
 * Params: props.slots, props.emptyMessage
 * Returns: JSX
 */
export function WeeklyGrid({ slots = [], emptyMessage = 'No classes scheduled.' }) {
  // useMemo — only recompute the row list when the `slots` array reference changes,
  // instead of re-sorting on every render.
  const rows = useMemo(() => buildRows(slots), [slots])

  if (slots.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)',
          fontSize: '0.9rem', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg, 12px)',
        }}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    // overflowX: auto — lets the grid scroll horizontally instead of squeezing
    // columns unreadably narrow on mobile screens.
    <div style={{ overflowX: 'auto', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg, 12px)' }}>
      <div style={{ minWidth: 900 }}>
        {/* Header row: blank time column + 6 weekday columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr)', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ padding: '10px 12px' }} />
          {DAY_LABELS.map((day) => (
            <div
              key={day}
              style={{ padding: '10px 12px', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* One row per distinct time range */}
        {rows.map((row, i) => (
          <div
            key={`${row.startTime}-${row.endTime}`}
            style={{
              display: 'grid', gridTemplateColumns: '90px repeat(6, 1fr)',
              borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none',
            }}
          >
            <div style={{ padding: '10px 12px', fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
              {row.startTime}
              <br />
              {row.endTime}
            </div>
            {DAY_LABELS.map((_, dayIndex) => {
              const dayOfWeek = dayIndex + 1
              const slot = findSlot(slots, row, dayOfWeek)
              return (
                <div key={dayOfWeek} style={{ padding: 8, display: 'flex', alignItems: 'center' }}>
                  <SlotCard slot={slot} />
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WeeklyGrid
