// src/pages/admin/faculties/FacultiesPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page: View all faculty members.
//
// Features:
//   - Table of all faculty with user info, department, designation
//   - Filter by department (dropdown)
//   - Search by name or email
//   - Click a row to see full detail in a modal
//
// Data flow:
//   useDepartments()      → GET /api/departments          (for filter options)
//   useFaculties(deptId)  → GET /api/faculties?departmentId=x
//   useFacultyById(uid)   → GET /api/faculty/:id          (modal detail)
// ─────────────────────────────────────────────────────────────

// src/pages/admin/faculties/FacultiesPage.jsx

import { useState } from 'react'
import { PageHeader }    from '@/components/ui/PageHeader'
import { Select }        from '@/components/ui/Select'
import { Badge }         from '@/components/ui/Badge'
import { Modal }         from '@/components/ui/Modal'
import { CardLoader }    from '@/components/ui/Loader'
import { useDepartments }                       from '@/hooks/useDepartments'
import { useFaculties, useFacultyById }         from '@/hooks/useFaculties'
import { formatDate }                           from '@/utils/formatters'

// Deterministic color from a string
function strColor(name = '') {
  const palette = ['#6366f1','#38bdf8','#34d399','#f87171','#fbbf24','#a78bfa','#fb923c']
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length
  return palette[idx]
}

function abbr(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
}

// ── Faculty Detail Modal ──────────────────────────────────────
function FacultyDetailModal({ userId, onClose }) {
  const { data: faculty, isLoading } = useFacultyById(userId)
  const color = faculty ? strColor(faculty.user.name) : 'var(--accent)'

  return (
    <Modal isOpen={!!userId} onClose={onClose} title="" maxWidth={480}>
      {isLoading ? (
        <div style={{ padding: '20px 0' }}><CardLoader lines={5} /></div>
      ) : faculty ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* ── Profile header ───────────────────────────── */}
          <div style={{
            background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)`,
            border: `1px solid ${color}25`,
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 20,
          }}>
            {/* Large avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
              background: `${color}25`, border: `2px solid ${color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', fontWeight: 800, color,
              fontFamily: 'var(--font-display)',
            }}>
              {abbr(faculty.user.name)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {faculty.user.name}
              </h3>
              <p style={{ margin: '3px 0 10px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {faculty.user.email}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <Badge type="role" value={faculty.user.role} />
                <Badge label={faculty.designation} color="sky" />
                <Badge type="status" value={faculty.user.isActive ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>

          {/* ── Detail grid ──────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { label: 'Department',     value: faculty.department.name },
              { label: 'Designation',    value: faculty.designation },
              { label: 'Office',         value: faculty.officeLocation || '—' },
              { label: 'Email verified', value: faculty.user.emailVerified ? '✓ Verified' : '✗ Not verified' },
              { label: 'Last login',     value: faculty.user.lastLoginAt ? formatDate(faculty.user.lastLoginAt, 'long') : 'Never' },
              { label: 'Member since',   value: formatDate(faculty.createdAt, 'long') },
            ].map(({ label, value }, i, arr) => (
              <div
                key={label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 14px',
                  background: i % 2 === 0 ? 'var(--bg-elevated)' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: label === 'Email verified'
                    ? (value.startsWith('✓') ? 'var(--success)' : 'var(--danger)')
                    : 'var(--text-primary)',
                  textAlign: 'right',
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Faculty not found.
        </div>
      )}
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function FacultiesPage() {
  const [deptFilter, setDeptFilter]   = useState('')
  const [search, setSearch]           = useState('')
  const [selectedUserId, setSelected] = useState(null)

  const { data: departments = [] } = useDepartments()
  const { data: faculties = [], isLoading, isError } = useFaculties(deptFilter ? Number(deptFilter) : null)

  const deptOptions = [
    { value: '', label: 'All departments' },
    ...departments.map(d => ({ value: String(d.id), label: d.name })),
  ]

  const filtered = faculties.filter(f => {
    if (!search) return true
    const q = search.toLowerCase()
    return f.user.name.toLowerCase().includes(q) ||
           f.user.email.toLowerCase().includes(q) ||
           f.designation.toLowerCase().includes(q)
  })

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>Failed to load faculty. Please refresh.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Faculty"
        subtitle="View and manage all faculty members across departments"
      />

      {/* ── Toolbar ─────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: 14, marginBottom: 24,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        flexWrap: 'wrap', alignItems: 'flex-end',
      }}>
        {/* Dept filter */}
        <div style={{ minWidth: 200, flex: '0 0 auto' }}>
          <Select
            label="Department"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            options={deptOptions}
            placeholder="All departments"
          />
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 36, background: 'var(--border-subtle)', alignSelf: 'flex-end', marginBottom: 1 }} />

        {/* Search */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Search
          </label>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Name, email or designation…"
              style={{
                width: '100%', background: 'var(--bg-input)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                fontSize: '0.875rem', padding: '0.6rem 0.875rem 0.6rem 2.25rem', outline: 'none',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-light)' }}
              onBlur={e  => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        {/* Result count */}
        <div style={{ alignSelf: 'flex-end', paddingBottom: 8, flexShrink: 0 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isLoading ? '…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      {/* ── Faculty List ─────────────────────────────────────── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 88px 80px', gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          {['Faculty Member', 'Department', 'Designation', 'Role', 'Status'].map(h => (
            <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</span>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3,4].map(i => <CardLoader key={i} lines={1} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 14px' }}>👤</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 4 }}>No faculty found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {search || deptFilter ? 'Try adjusting your filters.' : 'No faculty members have been added yet.'}
            </p>
          </div>
        )}

        {/* Rows */}
        {!isLoading && filtered.map((f, idx) => {
          const color = strColor(f.user.name)
          return (
            <div
              key={f.id}
              onClick={() => setSelected(f.userId)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 88px 80px',
                gap: 16, padding: '13px 20px', alignItems: 'center',
                borderBottom: idx < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                cursor: 'pointer', transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Avatar + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, overflow: 'hidden' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: `${color}20`, border: `1.5px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', fontWeight: 700, color,
                }}>
                  {abbr(f.user.name)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.user.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.user.email}
                  </p>
                </div>
              </div>

              {/* Department chip */}
              <div>
                <span style={{
                  display: 'inline-block',
                  background: `${strColor(f.department.name)}15`,
                  border: `1px solid ${strColor(f.department.name)}30`,
                  color: strColor(f.department.name),
                  borderRadius: 99, padding: '3px 10px',
                  fontSize: '0.75rem', fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%',
                }}>
                  {f.department.name}
                </span>
              </div>

              {/* Designation */}
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {f.designation}
              </p>

              {/* Role */}
              <Badge type="role" value={f.user.role} />

              {/* Status dot + label */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: f.user.isActive ? 'var(--success)' : 'var(--danger)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.78rem', color: f.user.isActive ? 'var(--success)' : 'var(--danger)', fontWeight: 500 }}>
                  {f.user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <FacultyDetailModal userId={selectedUserId} onClose={() => setSelected(null)} />
    </div>
  )
}
