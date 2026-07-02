// src/pages/faculty/timetable/FacultyTimetablePage.jsx
// ─────────────────────────────────────────────────────────────
// Component: FacultyTimetablePage (default export)
// Renders: the logged-in faculty member's teaching schedule — a
//          "Today" strip of classes happening today, followed by
//          the full weekly schedule rendered with WeeklyGrid.
// Props: none — reads everything via hooks (route is /faculty/timetable).
//
// All network calls go through src/api/timetable.api.js via the hooks
// in src/hooks/useTimetable.js — never call apiClient directly here.
// ─────────────────────────────────────────────────────────────

import { PageHeader } from '@/components/ui/PageHeader'
import { CardLoader } from '@/components/ui/Loader'
import { WeeklyGrid }  from '@/components/timetable/WeeklyGrid'
import { SlotCard }    from '@/components/timetable/SlotCard'
import { useFacultyTimetable, useFacultyTimetableToday } from '@/hooks/useTimetable'

// FacultyTimetablePage — top-level route component for /faculty/timetable.
// Params: none (props)
// Returns: JSX
export default function FacultyTimetablePage() {
  const { data: weekSlots = [],  isLoading: weekLoading }  = useFacultyTimetable()
  const { data: todaySlots = [], isLoading: todayLoading } = useFacultyTimetableToday()

  return (
    <div>
      <PageHeader title="My Timetable" subtitle="Your weekly teaching schedule and today's classes" />

      {/* ── Today's classes ──────────────────────────────────── */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Today
        </h2>
        {todayLoading ? (
          // Loading spinner/skeleton shown while GET /api/faculty/timetable/today is in flight.
          <CardLoader lines={2} />
        ) : todaySlots.length === 0 ? (
          <div style={{ padding: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No classes today.
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {/* .map() — one SlotCard per class scheduled for today. */}
            {todaySlots.map((slot) => <SlotCard key={slot.id} slot={slot} />)}
          </div>
        )}
      </div>

      {/* ── Full weekly schedule ─────────────────────────────── */}
      <div>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px' }}>
          Weekly Schedule
        </h2>
        {weekLoading ? (
          // Loading spinner/skeleton shown while GET /api/faculty/timetable is in flight.
          <CardLoader lines={5} />
        ) : (
          <WeeklyGrid slots={weekSlots} emptyMessage="No weekly schedule available yet." />
        )}
      </div>
    </div>
  )
}
