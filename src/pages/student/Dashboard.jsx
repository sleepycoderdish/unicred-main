// src/pages/student/Dashboard.jsx
// ─────────────────────────────────────────────────────────────
// Student dashboard.
// Shows a greeting card (name + role + school) and quick links.
//
// Where the displayed values come from:
//   - name     : the `user` object returned by /auth/login (stored in auth store)
//   - role     : decoded from the JWT access token
//   - schoolId : decoded from the JWT access token
//
// NOTE: the JWT only carries the schoolId, not the school's name. So we show
// the school identifier. If you later add a "get my school" endpoint, swap
// `School #<id>` for the real school name here.
// ─────────────────────────────────────────────────────────────

import { Link } from 'react-router-dom'
import { PageHeader }   from '@/components/ui/PageHeader'
import useAuthStore     from '@/store/auth.store'
import { roleLabel, getInitials } from '@/utils/formatters'

// Quick navigation tiles for the student.
const LINKS = [
  { label: 'My Session',  desc: 'Your current academic session', path: '/student/session' },
  { label: 'Results',     desc: 'View your published results',   path: '/student/results' },
  { label: 'CGPA',        desc: 'Your SGPA / CGPA history',       path: '/student/cgpa' },
  { label: 'Reappear',    desc: 'Apply for failed subjects',      path: '/student/reappear' },
]

export default function StudentDashboard() {
  // Read the logged-in user from the global auth store.
  const user = useAuthStore((s) => s.user)

  // Show the first name in the header greeting, full name on the card.
  const fullName  = user?.name ?? 'Student'
  const firstName = fullName.split(' ')[0]

  return (
    <div>
      <PageHeader
        title={`Welcome, ${firstName}`}
        subtitle={`${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}`}
      />

      {/* ── Identity card: name + role + school ─────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', padding: '20px 22px', marginBottom: 24,
      }}>
        {/* Avatar circle with initials */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-accent)', fontWeight: 800, fontSize: '1.1rem',
          fontFamily: 'var(--font-display)',
        }}>
          {getInitials(fullName)}
        </div>

        <div>
          {/* Name */}
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
            {fullName}
          </p>
          {/* Role */}
          <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            {roleLabel(user?.role)}
          </p>
          {/* School (only the id is available from the token) */}
          <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            School&nbsp;#{user?.schoolId ?? '—'}
          </p>
        </div>
      </div>

      {/* ── Quick links ─────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {LINKS.map(l => (
          <Link key={l.path} to={l.path} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)', padding: '18px 20px',
              transition: 'border-color 0.18s, transform 0.18s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{l.label}</p>
              <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}