// src/pages/student/subjects/SubjectDetailPage.jsx
// ─────────────────────────────────────────────────────────────
// Student views details for a single subject:
//   - Subject info card (name, code, type, credits, marks)
//   - Assigned faculty profile card (photo/bio/links when available)
//
// WHY THE FACULTY FETCH CAN RETURN NULL:
//   The faculty-assignments endpoint returns 404 when no faculty has been
//   assigned to this subject yet, OR when the student has no active session.
//   Both are normal states — not errors. useFacultyForSubject catches those
//   404s and returns null so we can show a clean empty state instead of
//   triggering an error toast.
// ─────────────────────────────────────────────────────────────

import { useParams, Link }        from 'react-router-dom'
import { PageHeader }             from '@/components/ui/PageHeader'
import { CardLoader }             from '@/components/ui/Loader'
import { useSubjectDetail }       from '@/hooks/useSubjects'
import { useFacultyForSubject }   from '@/hooks/useFacultyAssignments'

// Subject type → accent colour (matches SubjectsPage + MySessionPage)
const TYPE_COLOR = {
  theory:   '#6366f1',
  lab:      '#34d399',
  tutorial: '#fbbf24',
}

// Generate initials from a display name — same pattern as AppShell.jsx.
// "Anish Kumar" → "AK",  "Admin" → "AD"
function getInitials(name) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0].toUpperCase())
    .join('')
    .slice(0, 2)
}

export default function SubjectDetailPage() {
  // Pull the subjectId out of the URL: /student/subjects/:subjectId
  const { subjectId } = useParams()

  // Fetch the subject's own info (name, code, type, credits, marks)
  const { data: subject, isLoading: subjectLoading } = useSubjectDetail(subjectId)

  // Fetch the assigned faculty — null if nobody assigned yet (404 → null,
  // see useFacultyForSubject for why this is treated as a normal state)
  const { data: assignment, isLoading: facultyLoading } = useFacultyForSubject(subjectId)

  // The actual faculty object lives one level deeper inside the assignment
  const faculty = assignment?.faculty ?? null

  // Show a single loader while either fetch is in flight
  if (subjectLoading || facultyLoading) {
    return (
      <div>
        <PageHeader title="Subject Details" subtitle="Loading..." />
        <CardLoader lines={5} />
      </div>
    )
  }

  // Subject not found (shouldn't normally happen via normal navigation)
  if (!subject) {
    return (
      <div>
        <PageHeader title="Subject Details" subtitle="" />
        <div style={{
          textAlign: 'center', padding: '64px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Subject not found.
          </p>
        </div>
      </div>
    )
  }

  const typeColor = TYPE_COLOR[subject.subjectType] ?? '#6366f1'

  return (
    <div>
      {/* Back link to the subjects list */}
      <Link
        to="/student/subjects"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', color: 'var(--text-muted)',
          textDecoration: 'none', marginBottom: 20,
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-accent)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
      >
        ← Back to Subjects
      </Link>

      <PageHeader title={subject.name} subtitle={subject.courseCode} />

      {/* ── Subject info card ──────────────────────────────── */}
      <div style={{
        background:           'rgba(22,27,39,0.8)',
        backdropFilter:       'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:               '1px solid rgba(255,255,255,0.07)',
        borderRadius:         'var(--radius-lg)',
        padding:              '24px',
        marginBottom:          24,
      }}>
        {/* Subject type badge */}
        <div style={{ marginBottom: 20 }}>
          <span style={{
            fontSize: '0.7rem', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.05em',
            padding: '4px 12px', borderRadius: 99,
            background: `${typeColor}15`,
            border:    `1px solid ${typeColor}35`,
            color: typeColor,
          }}>
            {subject.subjectType ?? 'Theory'}
          </span>
        </div>

        {/* Key stats grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap:                  16,
        }}>
          {[
            { label: 'Course Code',   value: subject.courseCode },
            { label: 'Credits',       value: subject.credits },
            { label: 'Passing Marks', value: subject.passingMarks },
            { label: 'Total Marks',   value: subject.totalMarks },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                {label}
              </p>
              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600,
                color: 'var(--text-primary)' }}>
                {value ?? '—'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Assigned faculty section ───────────────────────── */}
      <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Assigned Faculty
      </p>

      {!faculty ? (
        // No faculty assigned yet — this is a normal/expected state, not an error
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>
            No faculty has been assigned to this subject yet.
          </p>
        </div>
      ) : (
        <div style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding:      '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>

            {/* Profile photo — or initials avatar as fallback */}
            {faculty.user?.profilePhotoUrl ? (
              <img
                src={faculty.user.profilePhotoUrl}
                alt={faculty.user.name}
                style={{
                  width: 72, height: 72, borderRadius: '50%',
                  objectFit: 'cover', flexShrink: 0,
                  border: '2px solid var(--border-subtle)',
                }}
              />
            ) : (
              <div style={{
                width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
                background:  'var(--bg-elevated)',
                border:      '2px solid var(--border-subtle)',
                display:     'flex', alignItems: 'center', justifyContent: 'center',
                fontSize:    '1.35rem', fontWeight: 700,
                color:       'var(--text-accent)',
                fontFamily:  'var(--font-display)',
              }}>
                {getInitials(faculty.user?.name)}
              </div>
            )}

            {/* Faculty text info */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Name */}
              <h3 style={{ margin: '0 0 2px', fontSize: '1.05rem', fontWeight: 700,
                color: 'var(--text-primary)' }}>
                {faculty.user?.name ?? '—'}
              </h3>

              {/* Designation (e.g. "Assistant Professor") */}
              {faculty.designation && (
                <p style={{ margin: '0 0 4px', fontSize: '0.82rem',
                  color: 'var(--text-accent)', fontWeight: 500 }}>
                  {faculty.designation}
                </p>
              )}

              {/* Email */}
              <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {faculty.user?.email ?? '—'}
              </p>

              {/* Office location */}
              {faculty.officeLocation && (
                <p style={{ margin: '0 0 10px', fontSize: '0.82rem',
                  color: 'var(--text-secondary)' }}>
                  📍 {faculty.officeLocation}
                </p>
              )}

              {/* Bio — only shown if the faculty has filled it in */}
              {faculty.user?.bio && (
                <p style={{
                  margin: '0 0 14px', fontSize: '0.85rem',
                  color: 'var(--text-secondary)', lineHeight: 1.6,
                  paddingTop: 12, borderTop: '1px solid var(--border-subtle)',
                }}>
                  {faculty.user.bio}
                </p>
              )}

              {/* External profile links — only shown when present */}
              {(faculty.user?.linkedinUrl || faculty.user?.githubUrl || faculty.user?.portfolioUrl) && (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
                  {faculty.user.linkedinUrl && (
                    <a
                      href={faculty.user.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.78rem', color: 'var(--text-accent)',
                        textDecoration: 'none' }}
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {faculty.user.githubUrl && (
                    <a
                      href={faculty.user.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.78rem', color: 'var(--text-accent)',
                        textDecoration: 'none' }}
                    >
                      GitHub ↗
                    </a>
                  )}
                  {faculty.user.portfolioUrl && (
                    <a
                      href={faculty.user.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.78rem', color: 'var(--text-accent)',
                        textDecoration: 'none' }}
                    >
                      Portfolio ↗
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
