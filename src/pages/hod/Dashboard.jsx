// src/pages/hod/Dashboard.jsx

import { Link } from 'react-router-dom'
import { PageHeader }        from '@/components/ui/PageHeader'
import { Badge }             from '@/components/ui/Badge'
import { CardLoader }        from '@/components/ui/Loader'
import { useSessions }       from '@/hooks/useSessions'
import { useSubjects }       from '@/hooks/useSubjects'
import { usePublications }   from '@/hooks/useResultPublications'
import { useDepartmentApplications } from '@/hooks/useReappear'
import useAuthStore           from '@/store/auth.store'

const Icons = {
  sessions:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  subjects:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
  results:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  users:       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
  reappear:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  timetable:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  arrow:       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
}

function StatCard({ icon, label, value, sub, color, loading, to }) {
  const inner = (
    <div style={{
      background: 'rgba(22,27,39,0.8)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)', borderRadius: 'var(--radius-lg)', padding: '22px',
      flex: 1, minWidth: 160, position: 'relative', overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.18s', cursor: to ? 'pointer' : 'default',
    }}
      onMouseEnter={e => { if (to) { e.currentTarget.style.borderColor = color; e.currentTarget.style.transform = 'translateY(-2px)' }}}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ position: 'absolute', top: -24, right: -24, width: 80, height: 80, borderRadius: '50%', background: `${color}12`, pointerEvents: 'none' }} />
      <div style={{ width: 40, height: 40, borderRadius: 10, marginBottom: 14, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
      <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{label}</p>
      {loading
        ? <div className="skeleton" style={{ height: 30, width: 56, borderRadius: 6, marginBottom: 4 }} />
        : <p style={{ margin: '0 0 4px', fontSize: '1.9rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>{value ?? '—'}</p>}
      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</p>
    </div>
  )
  return to ? <Link to={to} style={{ textDecoration: 'none', flex: 1, minWidth: 160 }}>{inner}</Link> : <div style={{ flex: 1, minWidth: 160 }}>{inner}</div>
}

function ActionCard({ icon, title, desc, path, color }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '18px 20px',
        display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        transition: 'border-color 0.18s, background 0.18s, transform 0.18s',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.transform = 'translateX(4px)' }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--bg-surface)'; e.currentTarget.style.transform = 'translateX(0)' }}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>{icon}</div>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: 2 }}>{title}</p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
        </div>
        <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{Icons.arrow}</span>
      </div>
    </Link>
  )
}

export default function HodDashboard() {
  const user = useAuthStore(s => s.user)
  const { data: sessions     = [], isLoading: sLoading } = useSessions()
  const { data: subjects     = [], isLoading: subLoading } = useSubjects()
  const { data: publications = [], isLoading: pLoading } = usePublications()
  const { data: reappearApps = [] } = useDepartmentApplications('pending')

  const activeSession  = sessions.find(s => s.status === 'active')
  const draftPubs      = publications.filter(p => p.status === 'draft').length
  const pendingReappear = reappearApps.length

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0] ?? 'HOD'}`}
        subtitle={`Head of Department · School #${user?.schoolId ?? '—'} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      {/* KPI row */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 28 }}>
        <StatCard icon={Icons.sessions}  label="Sessions"       value={sessions.length}   sub={activeSession ? `${activeSession.name} active` : 'No active session'} color="#6366f1" loading={sLoading}   to="/hod/sessions" />
        <StatCard icon={Icons.subjects}  label="Subjects"       value={subjects.length}   sub="In your department"       color="#38bdf8" loading={subLoading} to="/hod/subjects" />
        <StatCard icon={Icons.results}   label="Draft Results"  value={draftPubs}          sub="Awaiting submission"       color="#fbbf24" loading={pLoading}   to="/hod/results" />
        <StatCard icon={Icons.reappear}  label="Reappear Queue" value={pendingReappear}    sub="Pending your review"       color="#f87171" loading={false}      to="/hod/reappear" />
      </div>

      {/* Two-column */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

        {/* Left — recent publications */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Result Publications
          </p>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
            {pLoading ? (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
              </div>
            ) : publications.length === 0 ? (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 12 }}>No result publications yet.</p>
                <Link to="/hod/results" style={{ fontSize: '0.82rem', color: 'var(--text-accent)', textDecoration: 'none' }}>Create one →</Link>
              </div>
            ) : (
              publications.slice(0, 6).map((pub, idx) => (
                <Link key={pub.id} to={`/hod/results/${pub.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px',
                    borderBottom: idx < Math.min(publications.length, 6) - 1 ? '1px solid var(--border-subtle)' : 'none',
                    transition: 'background 0.12s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        Semester {pub.semesterNumber} · Batch {pub.batchYear}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                        {pub.submittedCount ?? 0}/{pub.totalSubjects ?? 0} submitted
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {/* Mini progress */}
                      <div style={{ width: 60, height: 5, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, width: `${pub.completionPercent ?? 0}%`, background: pub.completionPercent === 100 ? 'var(--success)' : 'var(--accent)' }} />
                      </div>
                      <Badge type="status" value={pub.status} />
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Right — quick actions */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Quick Actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionCard icon={Icons.sessions}  title="Academic Sessions" desc="Create and manage sessions"        path="/hod/sessions"    color="#6366f1" />
            <ActionCard icon={Icons.subjects}  title="Subjects"          desc="Manage courses and offerings"      path="/hod/subjects"    color="#38bdf8" />
            <ActionCard icon={Icons.users}     title="Assignments"       desc="Assign faculty to subjects"        path="/hod/assignments"  color="#34d399" />
            <ActionCard icon={Icons.results}   title="Results"           desc="Publish semester results"          path="/hod/results"     color="#fbbf24" />
            <ActionCard icon={Icons.reappear}  title="Reappear"          desc="Review reappear applications"      path="/hod/reappear"    color="#f87171" />
            <ActionCard icon={Icons.timetable} title="Timetable"         desc="Build and submit timetables"       path="/hod/timetable"   color="#a78bfa" />
          </div>
        </div>
      </div>
    </div>
  )
}