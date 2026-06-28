// src/pages/faculty/Dashboard.jsx
// Faculty dashboard — shows subject assignments, pending mark submissions,
// and quick navigation to all faculty actions.

import { Link } from 'react-router-dom'
import { PageHeader }       from '@/components/ui/PageHeader'
import { Badge }            from '@/components/ui/Badge'
import { CardLoader }       from '@/components/ui/Loader'
import { useMyAssignments } from '@/hooks/useAssignments'
import { useMySubjects }    from '@/hooks/useResultPublications'
import useAuthStore          from '@/store/auth.store'

const Icons = {
  book: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  upload: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
  clipboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  refresh: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
}

function StatCard({ icon, label, value, color, loading }) {
  return (
    <div style={{
      background: 'rgba(22,27,39,0.8)', backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--radius-lg)', padding: '22px',
      flex: 1, minWidth: 160, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80,
        borderRadius: '50%', background: `${color}12`, pointerEvents: 'none' }} />
      <div style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14,
        background: `${color}18`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
        {icon}
      </div>
      <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--text-muted)',
        textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</p>
      {loading
        ? <div className="skeleton" style={{ height: 30, width: 56, borderRadius: 6 }} />
        : <p style={{ margin: 0, fontSize: '1.9rem', fontWeight: 800, color,
            fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{value ?? '—'}</p>
      }
    </div>
  )
}

function ActionCard({ icon, title, desc, path, color }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 14,
        transition: 'border-color 0.18s, background 0.18s, transform 0.18s', cursor: 'pointer',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateX(0)' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
          {icon}
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>{title}</p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{Icons.arrow}</span>
      </div>
    </Link>
  )
}

export default function FacultyDashboard() {
  const user = useAuthStore(s => s.user)
  const { data: assignments = [], isLoading: aLoading } = useMyAssignments()
  const { data: subjects    = [], isLoading: sLoading } = useMySubjects()

  const pending   = subjects.filter(s => !s.isSubmitted).length
  const submitted = subjects.filter(s => s.isSubmitted).length

  // Group assignments by active session
  const activeSessions = [...new Set(
    assignments
      .filter(a => a.session?.status === 'active')
      .map(a => a.session?.name)
  )]

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] ?? 'Faculty'}`}
        subtitle={`Faculty dashboard · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard icon={Icons.book}      label="Subjects Assigned" value={assignments.length} color="#6366f1" loading={aLoading} />
        <StatCard icon={Icons.upload}    label="Pending Marks"     value={pending}            color="#fbbf24" loading={sLoading} />
        <StatCard icon={Icons.clipboard} label="Marks Submitted"   value={submitted}          color="#34d399" loading={sLoading} />
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Left — assigned subjects */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            My Subjects This Session
          </p>

          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

            {aLoading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
              </div>
            ) : assignments.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  No subjects assigned yet. Your HOD will assign subjects to you.
                </p>
              </div>
            ) : (
              assignments.map((a, idx) => {
                // Find submission status for this subject
                const subStatus = subjects.find(s => s.subject?.id === a.subjectId)
                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                    borderBottom: idx < assignments.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Subject type indicator */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: a.subject?.subjectType === 'lab' ? 'rgba(52,211,153,0.12)' : 'rgba(99,102,241,0.12)',
                      border: `1px solid ${a.subject?.subjectType === 'lab' ? 'rgba(52,211,153,0.3)' : 'rgba(99,102,241,0.3)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.68rem', fontWeight: 700,
                      color: a.subject?.subjectType === 'lab' ? '#34d399' : '#818cf8',
                    }}>
                      {(a.subject?.subjectType ?? 'TH').slice(0,2).toUpperCase()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem',
                        color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {a.subject?.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                        {a.subject?.courseCode} · Sem {a.semesterNumber} · Batch {a.batchYear}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
                      <Badge type="status" value={a.session?.status} />
                      {subStatus && (
                        <Badge
                          label={subStatus.isSubmitted ? 'Submitted' : 'Pending'}
                          color={subStatus.isSubmitted ? 'success' : 'warning'}
                        />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right — quick actions */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Quick Actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionCard icon={Icons.book}      title="My Assignments"    desc="View all subjects assigned to you"             path="/faculty/assignments" color="#6366f1" />
            <ActionCard icon={Icons.upload}    title="Upload Marks"      desc="Submit marks for your assigned subjects"       path="/faculty/marks"       color="#fbbf24" />
            <ActionCard icon={Icons.clipboard} title="Internal Marks"    desc="Upload quiz, midterm and lab assessments"      path="/faculty/assessments" color="#38bdf8" />
            <ActionCard icon={Icons.refresh}   title="Reappear Marks"    desc="Submit marks for approved reappear students"   path="/faculty/reappear"    color="#a78bfa" />
          </div>

          {/* Active session notice */}
          {activeSessions.length > 0 && (
            <div style={{ marginTop: 16, background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
              <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-accent)', marginBottom: 4 }}>
                Active Session
              </p>
              {activeSessions.map(s => (
                <p key={s} style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{s}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
