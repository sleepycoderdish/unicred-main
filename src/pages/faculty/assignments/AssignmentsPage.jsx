// src/pages/faculty/assignments/AssignmentsPage.jsx
// Shows all subjects assigned to the faculty member, grouped by session.

import { useState }         from 'react'
import { PageHeader }       from '@/components/ui/PageHeader'
import { Badge }            from '@/components/ui/Badge'
import { CardLoader }       from '@/components/ui/Loader'
import { useMyAssignments } from '@/hooks/useAssignments'

export default function AssignmentsPage() {
  const { data: assignments = [], isLoading } = useMyAssignments()

  // Group by session name
  const grouped = assignments.reduce((acc, a) => {
    const key = a.session?.name ?? 'Unknown Session'
    if (!acc[key]) acc[key] = { session: a.session, items: [] }
    acc[key].items.push(a)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="My Assignments"
        subtitle="Subjects assigned to you across all sessions"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2].map(i => <CardLoader key={i} lines={3} />)}
        </div>
      ) : assignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No subjects assigned yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(grouped).map(([sessionName, { session, items }]) => (
            <div key={sessionName}>
              {/* Session header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {sessionName}
                </h3>
                <Badge type="status" value={session?.status} />
              </div>

              {/* Subject cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
                {items.map(a => (
                  <div key={a.id} style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-lg)', padding: '18px 20px',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                  >
                    {/* Subject type tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 99,
                        background: a.subject?.subjectType === 'lab'
                          ? 'rgba(52,211,153,0.12)' : a.subject?.subjectType === 'tutorial'
                          ? 'rgba(251,191,36,0.12)' : 'rgba(99,102,241,0.12)',
                        color: a.subject?.subjectType === 'lab'
                          ? '#34d399' : a.subject?.subjectType === 'tutorial'
                          ? '#fbbf24' : '#818cf8',
                        border: a.subject?.subjectType === 'lab'
                          ? '1px solid rgba(52,211,153,0.3)' : a.subject?.subjectType === 'tutorial'
                          ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(99,102,241,0.3)',
                      }}>
                        {a.subject?.subjectType ?? 'Theory'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {a.subject?.credits} credits
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 4px', fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {a.subject?.name}
                    </h4>
                    <p style={{ margin: '0 0 12px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {a.subject?.courseCode}
                    </p>

                    {/* Details */}
                    <div style={{ display: 'flex', gap: 16, paddingTop: 12,
                      borderTop: '1px solid var(--border-subtle)' }}>
                      {[
                        { label: 'Semester', value: `Sem ${a.semesterNumber}` },
                        { label: 'Batch',    value: a.batchYear },
                        { label: 'Total',    value: `${a.subject?.totalMarks} marks` },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)',
                            textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                          <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 2 }}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
