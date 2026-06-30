// src/pages/student/subjects/SubjectsPage.jsx
// ─────────────────────────────────────────────────────────────
// Student views all subjects offered in their current session.
//
// Data flow:
//   1. useMySession()  → get the student's active registration
//                        (gives sessionId, semesterNumber, batchYear)
//   2. useOfferings()  → fetch all course offerings for that session
//   3. Client filter   → keep only offerings matching this student's
//                        batchYear + semesterNumber (same as MySessionPage)
//
// Each subject card is a clickable Link to /student/subjects/:subjectId
// where the student can see full details and the assigned faculty.
// ─────────────────────────────────────────────────────────────

import { Link }         from 'react-router-dom'
import { PageHeader }   from '@/components/ui/PageHeader'
import { CardLoader }   from '@/components/ui/Loader'
import { useMySession } from '@/hooks/useStudentRegistration'
import { useOfferings } from '@/hooks/useSubjects'

// Subject type → accent colour (matches MySessionPage.jsx)
const TYPE_COLOR = {
  theory:   '#6366f1',
  lab:      '#34d399',
  tutorial: '#fbbf24',
}

export default function SubjectsPage() {
  const { data: registration, isLoading } = useMySession()

  // Only fetch offerings once we know which session the student is in
  const sessionId = registration?.session?.id ?? null
  const { data: offerings = [], isLoading: offLoading } = useOfferings(sessionId)

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div>
        <PageHeader title="My Subjects" subtitle="Subjects offered in your current session" />
        <CardLoader lines={5} />
      </div>
    )
  }

  // ── Not enrolled in any session ────────────────────────────
  if (!registration) {
    return (
      <div>
        <PageHeader title="My Subjects" subtitle="Subjects offered in your current session" />
        <div style={{
          textAlign:    'center',
          padding:      '64px 20px',
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, margin: '0 auto 16px',
          }}>
            📚
          </div>
          <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>
            Not enrolled in any session
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Your HOD hasn't registered you in a session yet. Check back later.
          </p>
        </div>
      </div>
    )
  }

  // Filter to only the offerings for this student's batch + semester
  const myOfferings = offerings.filter(o =>
    o.batchYear      === registration.batchYear &&
    o.semesterNumber === registration.semesterNumber
  )

  return (
    <div>
      <PageHeader
        title="My Subjects"
        subtitle={`Semester ${registration.semesterNumber} · Batch ${registration.batchYear}`}
      />

      {/* Offerings loading */}
      {offLoading ? (
        <CardLoader lines={3} />
      ) : myOfferings.length === 0 ? (
        // No offerings yet for this batch + semester
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No subjects have been offered for this session yet.
          </p>
        </div>
      ) : (
        // Subject card grid — one card per offered subject
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                  14,
        }}>
          {myOfferings.map(offering => {
            const color = TYPE_COLOR[offering.subject?.subjectType] ?? '#6366f1'
            return (
              // Link to the detail page using the subject's database id
              <Link
                key={offering.id}
                to={`/student/subjects/${offering.subject?.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background:   'var(--bg-surface)',
                    border:       '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding:      '18px 20px',
                    transition:   'border-color 0.15s, transform 0.15s',
                    cursor:       'pointer',
                    height:       '100%',
                    boxSizing:    'border-box',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${color}50`
                    e.currentTarget.style.transform   = 'translateY(-1px)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)'
                    e.currentTarget.style.transform   = 'none'
                  }}
                >
                  {/* Subject type badge + credits */}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 700,
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                      padding: '3px 10px', borderRadius: 99,
                      background: `${color}15`,
                      border:    `1px solid ${color}35`,
                      color,
                    }}>
                      {offering.subject?.subjectType ?? 'Theory'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {offering.subject?.credits} credits
                    </span>
                  </div>

                  {/* Subject name */}
                  <h3 style={{ margin: '0 0 4px', fontSize: '0.925rem', fontWeight: 700,
                    color: 'var(--text-primary)' }}>
                    {offering.subject?.name}
                  </h3>

                  {/* Course code */}
                  <p style={{ margin: '0 0 12px', fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {offering.subject?.courseCode}
                  </p>

                  {/* "View details" hint at the bottom */}
                  <div style={{
                    paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
                    display: 'flex', justifyContent: 'flex-end',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-accent)' }}>
                      View details →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
