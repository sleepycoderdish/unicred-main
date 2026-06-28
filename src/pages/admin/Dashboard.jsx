// src/pages/admin/Dashboard.jsx

import { Link } from 'react-router-dom'
import { PageHeader }     from '@/components/ui/PageHeader'
import { CardLoader }     from '@/components/ui/Loader'
import { useDepartments } from '@/hooks/useDepartments'
import { useFaculties }   from '@/hooks/useFaculties'

// Icons as inline SVGs — no icon library needed
const Icons = {
  departments: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/>
      <line x1="10" y1="6" x2="10" y2="6.01"/><line x1="14" y1="6" x2="14" y2="6.01"/>
      <line x1="10" y1="10" x2="10" y2="10.01"/><line x1="14" y1="10" x2="14" y2="10.01"/>
    </svg>
  ),
  check: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  clock: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  grading: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  arrow: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, to, loading }) {
  return (
    <Link to={to} style={{ textDecoration: 'none', flex: 1, minWidth: 170 }}>
      <div
        style={{
          background:        'rgba(22,27,39,0.8)',
          backdropFilter:    'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border:            '1px solid rgba(255,255,255,0.07)',
          borderRadius:      'var(--radius-lg)',
          padding:           '22px',
          transition:        'border-color 0.2s ease, transform 0.18s ease',
          cursor:            'pointer',
          position:          'relative',
          overflow:          'hidden',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.transform   = 'translateY(-3px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
          e.currentTarget.style.transform   = 'translateY(0)'
        }}
      >
        {/* Subtle color wash in corner */}
        <div style={{
          position: 'absolute', top: -30, right: -30,
          width: 90, height: 90, borderRadius: '50%',
          background: `${color}12`, pointerEvents: 'none',
        }} />

        {/* Icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, marginBottom: 16,
          background: `${color}18`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>

        <p style={{ margin: '0 0 4px', fontSize: '0.72rem', color: 'var(--text-muted)',
          textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>
          {label}
        </p>

        {loading ? (
          <div className="skeleton" style={{ height: 32, width: 64, borderRadius: 6, marginBottom: 4 }} />
        ) : (
          <p style={{ margin: '0 0 4px', fontSize: '2rem', fontWeight: 800, color,
            fontFamily: 'var(--font-display)', lineHeight: 1.1 }}>
            {value ?? '—'}
          </p>
        )}

        <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{sub}</p>
      </div>
    </Link>
  )
}

// ── Quick action card ──────────────────────────────────────────
function ActionCard({ icon, title, desc, path, color }) {
  return (
    <Link to={path} style={{ textDecoration: 'none' }}>
      <div
        style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding:      '20px 22px',
          display:      'flex',
          alignItems:   'center',
          gap:           14,
          transition:   'border-color 0.18s ease, background 0.18s ease, transform 0.18s ease',
          cursor:       'pointer',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.background  = 'var(--bg-elevated)'
          e.currentTarget.style.transform   = 'translateX(4px)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-subtle)'
          e.currentTarget.style.background  = 'var(--bg-surface)'
          e.currentTarget.style.transform   = 'translateX(0)'
        }}
      >
        {/* Icon box */}
        <div style={{
          width: 40, height: 40, borderRadius: 10, flexShrink: 0,
          background: `${color}15`, border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color,
        }}>
          {icon}
        </div>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem',
            color: 'var(--text-primary)', marginBottom: 2 }}>
            {title}
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)',
            lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {desc}
          </p>
        </div>

        {/* Arrow */}
        <span style={{ color: 'var(--text-muted)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          {Icons.arrow}
        </span>
      </div>
    </Link>
  )
}

// ── Department HOD status bar ─────────────────────────────────
function HodStatusBar({ departments, loading }) {
  if (loading) return <CardLoader lines={2} />
  if (!departments.length) return null

  const withHod    = departments.filter(d => d.hodUserId !== null).length
  const withoutHod = departments.length - withHod
  const pct        = Math.round((withHod / departments.length) * 100)

  return (
    <div style={{
      background:   'var(--bg-surface)',
      border:       '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-lg)',
      padding:      '20px 22px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          HOD Coverage
        </p>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {withHod} of {departments.length} departments
        </span>
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 99, height: 8, overflow: 'hidden', marginBottom: 12 }}>
        <div style={{
          height: '100%', borderRadius: 99,
          width: `${pct}%`,
          background: pct === 100
            ? 'var(--success)'
            : `linear-gradient(90deg, var(--accent), var(--accent-sky))`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Department chips */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {departments.map(d => (
          <Link key={d.id} to="/admin/departments" style={{ textDecoration: 'none' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
              background: d.hodUserId
                ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
              border: d.hodUserId
                ? '1px solid rgba(52,211,153,0.25)' : '1px solid rgba(251,191,36,0.25)',
              color: d.hodUserId ? 'var(--success)' : 'var(--warning)',
            }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%',
                background: d.hodUserId ? 'var(--success)' : 'var(--warning)',
                display: 'inline-block', flexShrink: 0 }} />
              {d.name}
            </span>
          </Link>
        ))}
      </div>

      {withoutHod > 0 && (
        <p style={{ margin: '10px 0 0', fontSize: '0.75rem', color: 'var(--warning)' }}>
          {withoutHod} department{withoutHod > 1 ? 's' : ''} still need an HOD.
        </p>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const { data: departments = [], isLoading: dLoading } = useDepartments()
  const { data: faculties   = [], isLoading: fLoading } = useFaculties()

  const withHod    = departments.filter(d => d.hodUserId !== null).length
  const withoutHod = departments.length - withHod

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle={`School-wide overview · ${new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}`}
      />

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 24 }}>
        <StatCard
          icon={Icons.departments} label="Departments"
          value={departments.length} sub="Total in this school"
          color="#6366f1" to="/admin/departments" loading={dLoading}
        />
        <StatCard
          icon={Icons.check} label="HOD Assigned"
          value={withHod} sub={`${withoutHod} pending assignment`}
          color="#34d399" to="/admin/departments" loading={dLoading}
        />
        <StatCard
          icon={Icons.users} label="Faculty"
          value={faculties.length} sub="Across all departments"
          color="#38bdf8" to="/admin/faculties" loading={fLoading}
        />
      </div>

      {/* ── Two-column layout ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* Left — Quick actions */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Quick Actions
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ActionCard icon={Icons.departments} title="Manage Departments"
              desc="Create departments and assign Heads of Department"
              path="/admin/departments" color="#6366f1" />
            <ActionCard icon={Icons.users} title="View Faculty"
              desc="Browse all faculty members across departments"
              path="/admin/faculties" color="#38bdf8" />
            <ActionCard icon={Icons.clock} title="Timetable Approvals"
              desc="Review and approve timetables submitted by HODs"
              path="/admin/timetables" color="#34d399" />
            <ActionCard icon={Icons.grading} title="Grading System"
              desc="Configure grade scale used for result computation"
              path="/admin/grading" color="#a78bfa" />
            <ActionCard icon={Icons.shield} title="Audit Logs"
              desc="View all authentication and system events"
              path="/admin/audit" color="#fbbf24" />
          </div>
        </div>

        {/* Right — HOD coverage */}
        <div>
          <p style={{ margin: '0 0 12px', fontSize: '0.72rem', fontWeight: 600,
            color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            HOD Status
          </p>
          <HodStatusBar departments={departments} loading={dLoading} />
        </div>
      </div>
    </div>
  )
}
