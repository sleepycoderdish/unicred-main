// src/pages/student/session/MySessionPage.jsx
// ─────────────────────────────────────────────────────────────
// Student views their own current session registration.
//
// API Contract §7:
//   GET /studentReg/my-session
//
// Shows:
//   - Session name, academic year, semester type, dates, status
//   - Their semester number and batch year for this session
//   - Registration status (active / detained / completed)
//   - The subjects offered in their session (from CourseOfferings)
// ─────────────────────────────────────────────────────────────

import { Link }       from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { CardLoader } from '@/components/ui/Loader'
import { Badge }      from '@/components/ui/Badge'
import { useMySession } from '@/hooks/useStudentRegistration'
import { useOfferings } from '@/hooks/useSubjects'
import { formatDate }   from '@/utils/formatters'

// Registration status colours
const REG_COLOR = {
  active:    { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  color: 'var(--success)' },
  completed: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  color: 'var(--text-accent)' },
  detained:  { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', color: 'var(--danger)' },
}

// Semester type display
const SEM_TYPE_LABEL = { odd: 'Odd Semester', even: 'Even Semester' }

// Subject type colour
const TYPE_COLOR = {
  theory:   '#6366f1',
  lab:      '#34d399',
  tutorial: '#fbbf24',
}

export default function MySessionPage() {
  const { data: registration, isLoading } = useMySession()

  // Fetch subjects offered in the current session
  // Only runs once we have the sessionId
  const sessionId = registration?.sessionId ?? null
  const { data: offerings = [], isLoading: offLoading } = useOfferings(sessionId)

  if (isLoading) {
    return (
      <div>
        <PageHeader title="My Session" subtitle="Your current academic session" />
        <CardLoader lines={5} />
      </div>
    )
  }

  // Student is not registered in any active session
  if (!registration) {
    return (
      <div>
        <PageHeader title="My Session" subtitle="Your current academic session" />
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
            🗓
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

  const session  = registration.session
  const regColor = REG_COLOR[registration.status] ?? REG_COLOR.active

  return (
    <div>
      <PageHeader
        title="My Session"
        subtitle="Your current academic session and enrolled subjects"
      />

      {/* ── Session info card ─────────────────────────────── */}
      <div style={{
        background:    'rgba(22,27,39,0.8)',
        backdropFilter:'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:        '1px solid rgba(255,255,255,0.07)',
        borderRadius:  'var(--radius-lg)',
        padding:       '24px',
        marginBottom:  24,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
          alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            {/* Session name + type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700,
                color: 'var(--text-primary)' }}>
                {session?.name}
              </h2>
              <Badge type="status" value={session?.status} />
            </div>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {session?.academicYear} · {SEM_TYPE_LABEL[session?.semesterType] ?? session?.semesterType}
            </p>
          </div>

          {/* Registration status chip */}
          <span style={{
            padding:      '5px 14px',
            borderRadius:  99,
            fontSize:     '0.78rem',
            fontWeight:    600,
            background:    regColor.bg,
            border:       `1px solid ${regColor.border}`,
            color:         regColor.color,
            textTransform: 'capitalize',
            flexShrink:    0,
          }}>
            {registration.status}
          </span>
        </div>

        {/* Detail grid */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap:                  16,
          marginTop:            20,
          paddingTop:           20,
          borderTop:           '1px solid var(--border-subtle)',
        }}>
          {[
            { label: 'Semester',   value: `Semester ${registration.semesterNumber}` },
            { label: 'Batch',      value: registration.batchYear },
            { label: 'Start Date', value: formatDate(session?.startDate) },
            { label: 'End Date',   value: formatDate(session?.endDate) },
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

      {/* ── Enrolled subjects ─────────────────────────────── */}
      <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
        color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        Enrolled Subjects
      </p>

      {offLoading ? (
        <CardLoader lines={3} />
      ) : offerings.length === 0 ? (
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
        <div style={{
          display:             'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap:                  14,
        }}>
          {offerings
            // Filter to student's batch + semester
            .filter(o =>
              o.batchYear      === registration.batchYear &&
              o.semesterNumber === registration.semesterNumber
            )
            .map(offering => {
              const color = TYPE_COLOR[offering.subject?.subjectType] ?? '#6366f1'
              return (
                <div
                  key={offering.id}
                  style={{
                    background:   'var(--bg-surface)',
                    border:       '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)',
                    padding:      '18px 20px',
                    transition:   'border-color 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${color}50`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                >
                  {/* Subject type tag */}
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 12 }}>
                    <span style={{
                      fontSize:     '0.7rem', fontWeight: 700,
                      textTransform:'uppercase', letterSpacing: '0.05em',
                      padding:      '3px 10px', borderRadius: 99,
                      background:   `${color}15`,
                      border:       `1px solid ${color}35`,
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
                  <p style={{ margin: 0, fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)' }}>
                    {offering.subject?.courseCode}
                  </p>

                  {/* Passing marks */}
                  <div style={{
                    marginTop:   12, paddingTop: 12,
                    borderTop:  '1px solid var(--border-subtle)',
                    display:    'flex', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Pass: {offering.subject?.passingMarks}/{offering.subject?.totalMarks}
                    </span>
                    {/* Link to results if they exist */}
                    <Link
                      to="/student/results"
                      style={{ fontSize: '0.75rem', color: 'var(--text-accent)',
                        textDecoration: 'none' }}
                    >
                      View result →
                    </Link>
                  </div>
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
