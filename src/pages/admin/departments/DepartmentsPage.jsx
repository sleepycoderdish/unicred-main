// src/pages/admin/departments/DepartmentsPage.jsx
// ─────────────────────────────────────────────────────────────
// Admin page: Manage departments.
//
// Features:
//   - View all departments in a table (name, HOD, created date)
//   - Create a new department via modal
//   - Assign / change a department's HOD via a second modal
//     (shows all faculty in a searchable list, admin picks one)
//
// Data flow:
//   useDepartments()     → GET /api/departments
//   useCreateDepartment()→ POST /api/departments
//   useUpdateDepartment()→ PUT /api/departments/:id  { hodUserId }
//   useFaculties()       → GET /api/faculties   (fetched inside AssignHodModal)
// ─────────────────────────────────────────────────────────────


import { useState } from 'react'
import { PageHeader }  from '@/components/ui/PageHeader'
import { Button }      from '@/components/ui/Button'
import { Input }       from '@/components/ui/Input'
import { Modal }       from '@/components/ui/Modal'
import { Badge }       from '@/components/ui/Badge'
import { CardLoader }  from '@/components/ui/Loader'
import { Spinner }     from '@/components/ui/Loader'
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '@/hooks/useDepartments'
import { useFaculties } from '@/hooks/useFaculties'
import { formatDate }  from '@/utils/formatters'

// Deterministic color from department name
function deptColor(name = '') {
  const palette = ['#6366f1','#38bdf8','#34d399','#f87171','#fbbf24','#a78bfa','#fb923c']
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length
  return palette[idx]
}

// Two-letter abbreviation for avatar
function abbr(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??'
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ icon, label, value, color, loading }) {
  return (
    <div style={{
      flex: 1, minWidth: 160,
      background: 'rgba(22,27,39,0.8)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, border: `1px solid ${color}35`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</p>
        <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {loading ? '…' : (value ?? '—')}
        </p>
      </div>
    </div>
  )
}

// ── Assign HOD Modal ──────────────────────────────────────────
function AssignHodModal({ department, isOpen, onClose }) {
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const { data: faculties = [], isLoading: facultiesLoading } = useFaculties()
  const { mutate: updateDept, isPending: updating } = useUpdateDepartment()

  const filtered = faculties.filter(f => {
    const q = search.toLowerCase()
    return f.user.name.toLowerCase().includes(q) ||
           f.user.email.toLowerCase().includes(q) ||
           f.department.name.toLowerCase().includes(q)
  })

  function handleConfirm() {
    if (!selectedUserId) return
    updateDept({ id: department.id, hodUserId: selectedUserId }, {
      onSuccess: () => { onClose(); setSelectedUserId(null); setSearch('') },
    })
  }

  function handleClose() { setSelectedUserId(null); setSearch(''); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Assign HOD — ${department?.name}`} maxWidth={520}>

      {/* Current HOD banner */}
      {department?.hodUserId ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            This department already has an HOD. Selecting a new one will replace them.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--warning-light)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: 16 }}>
          <span style={{ fontSize: 14 }}>⚠</span>
          <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--warning)' }}>No HOD assigned yet.</p>
        </div>
      )}

      {/* Search */}
      <Input
        placeholder="Search by name, email or department…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 10 }}
      />

      {/* Faculty list */}
      <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {facultiesLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <Spinner size={24} style={{ color: 'var(--accent)' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No faculty found.</p>
          </div>
        ) : filtered.map(f => {
          const sel = selectedUserId === f.userId
          const color = deptColor(f.department.name)
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedUserId(sel ? null : f.userId)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 'var(--radius-sm)', width: '100%',
                border: `1px solid ${sel ? 'var(--accent)' : 'var(--border-subtle)'}`,
                background: sel ? 'var(--accent-light)' : 'var(--bg-elevated)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
            >
              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: sel ? 'var(--accent)' : `${color}20`,
                border: `1px solid ${sel ? 'var(--accent)' : color + '45'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.72rem', fontWeight: 700,
                color: sel ? '#fff' : color,
              }}>
                {abbr(f.user.name)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.user.name}</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {f.user.email} · <span style={{ color }}>{f.department.name}</span>
                </p>
              </div>

              {/* Designation */}
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>{f.designation}</span>

              {/* Check */}
              {sel && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <Modal.Footer>
        <Button variant="ghost" onClick={handleClose} disabled={updating}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm} loading={updating} loadingText="Assigning…" disabled={!selectedUserId}>
          Confirm assignment
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ── Create Department Modal ───────────────────────────────────
function CreateDepartmentModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const { mutate: createDept, isPending } = useCreateDepartment()

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setError('Department name is required.'); return }
    if (name.trim().length < 2) { setError('Name must be at least 2 characters.'); return }
    createDept(name.trim(), {
      onSuccess: () => { setName(''); setError(''); onClose() },
    })
  }

  function handleClose() { setName(''); setError(''); onClose() }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="New Department" maxWidth={420}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
        Create a new academic department. You can assign an HOD after it's created.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <Input
          label="Department name"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="e.g. Electrical Engineering"
          error={error}
          required
          autoFocus
        />
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={handleClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating…">Create department</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function DepartmentsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState(null)

  const { data: departments = [], isLoading, isError } = useDepartments()

  const total      = departments.length
  const withHod    = departments.filter(d => d.hodUserId !== null).length
  const withoutHod = total - withHod

  if (isError) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>⚠️</div>
        <p style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>Failed to load departments. Please refresh the page.</p>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Departments"
        subtitle="Manage academic departments and assign Heads of Department"
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            + New Department
          </Button>
        }
      />

      {/* ── KPI Row ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap' }}>
        <KpiCard icon="🏛"  label="Total Departments" value={total}      color="var(--text-accent)" loading={isLoading} />
        <KpiCard icon="✅"  label="HOD Assigned"      value={withHod}    color="var(--success)"     loading={isLoading} />
        <KpiCard icon="⏳"  label="Pending HOD"       value={withoutHod} color="var(--warning)"     loading={isLoading} />
      </div>

      {/* ── Department List ──────────────────────────────────── */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

        {/* List header */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, padding: '11px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {isLoading ? 'Loading…' : `${departments.length} department${departments.length !== 1 ? 's' : ''}`}
          </span>
          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</span>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && departments.length === 0 && (
          <div style={{ padding: '64px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--accent-light)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 16px' }}>🏛</div>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: 6 }}>No departments yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>Create your first department to get started.</p>
            <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>+ Create department</Button>
          </div>
        )}

        {/* Rows */}
        {!isLoading && departments.map((dept, idx) => {
          const color = deptColor(dept.name)
          const hasHod = !!dept.hodUserId
          return (
            <div
              key={dept.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px',
                borderBottom: idx < departments.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Department avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: 11, flexShrink: 0,
                background: `${color}18`, border: `1px solid ${color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800, color, letterSpacing: '0.02em',
                fontFamily: 'var(--font-display)',
              }}>
                {abbr(dept.name)}
              </div>

              {/* Name + meta */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.925rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {dept.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Created {formatDate(dept.createdAt)}
                </p>
              </div>

              {/* HOD status */}
              <div style={{ flexShrink: 0 }}>
                {hasHod ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 99, padding: '4px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>HOD Assigned</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 99, padding: '4px 12px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)' }}>No HOD</span>
                  </div>
                )}
              </div>

              {/* Action */}
              <Button
                variant={hasHod ? 'ghost' : 'accent'}
                size="sm"
                onClick={() => setAssignTarget(dept)}
                style={{ flexShrink: 0 }}
              >
                {hasHod ? 'Change HOD' : 'Assign HOD'}
              </Button>
            </div>
          )
        })}
      </div>

      <CreateDepartmentModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
      {assignTarget && (
        <AssignHodModal department={assignTarget} isOpen={!!assignTarget} onClose={() => setAssignTarget(null)} />
      )}
    </div>
  )
}
