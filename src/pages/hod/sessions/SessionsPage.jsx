// src/pages/hod/sessions/SessionsPage.jsx
// HOD manages academic sessions.
// Lifecycle: upcoming → active → completed → archived (one-way, no going back).
// Archived sessions are fully read-only.

import { useState } from 'react'
import { PageHeader }          from '@/components/ui/PageHeader'
import { Button }              from '@/components/ui/Button'
import { Input }               from '@/components/ui/Input'
import { Select }              from '@/components/ui/Select'
import { Modal }               from '@/components/ui/Modal'
import { Badge }               from '@/components/ui/Badge'
import { CardLoader }          from '@/components/ui/Loader'
import { useSessions, useCreateSession, useUpdateSessionStatus } from '@/hooks/useSessions'
import { formatDate } from '@/utils/formatters'

// Allowed next statuses per current status
const NEXT_STATUS = {
  upcoming:  { label: 'Activate',  next: 'active',    variant: 'primary' },
  active:    { label: 'Complete',  next: 'completed', variant: 'ghost' },
  completed: { label: 'Archive',   next: 'archived',  variant: 'ghost' },
  archived:  null,
}

function CreateSessionModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ name: '', academicYear: '', semesterType: '', startDate: '', endDate: '' })
  const [errors, setErrors] = useState({})
  const { mutate: create, isPending } = useCreateSession()

  function validate() {
    const e = {}
    if (!form.name.trim())        e.name = 'Required'
    if (!form.academicYear.trim())e.academicYear = 'Required e.g. 2026-27'
    if (!form.semesterType)       e.semesterType = 'Required'
    if (!form.startDate)          e.startDate = 'Required'
    if (!form.endDate)            e.endDate = 'Required'
    if (form.startDate && form.endDate && form.endDate <= form.startDate) e.endDate = 'Must be after start date'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    create(form, { onSuccess: () => { setForm({ name:'',academicYear:'',semesterType:'',startDate:'',endDate:'' }); onClose() }})
  }

  const f = (label, key, type='text', placeholder='') => (
    <Input label={label} type={type} value={form[key]} placeholder={placeholder}
      error={errors[key]}
      onChange={ev => { setForm(p => ({ ...p, [key]: ev.target.value })); setErrors(p => ({ ...p, [key]: '' })) }}
      required />
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Academic Session" maxWidth={440}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {f('Session name', 'name', 'text', 'e.g. 2026-27 Odd Semester')}
          {f('Academic year', 'academicYear', 'text', 'e.g. 2026-27')}
          <Select label="Semester type" value={form.semesterType} error={errors.semesterType}
            onChange={e => { setForm(p => ({ ...p, semesterType: e.target.value })); setErrors(p => ({ ...p, semesterType: '' })) }}
            options={[{ value: 'odd', label: 'Odd' }, { value: 'even', label: 'Even' }]}
            placeholder="Select type" required />
          {f('Start date', 'startDate', 'date')}
          {f('End date',   'endDate',   'date')}
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating...">Create session</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default function SessionsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: sessions = [], isLoading } = useSessions()
  const { mutate: updateStatus, isPending: updating } = useUpdateSessionStatus()

  // Sort: active first, then upcoming, completed, archived
  const ORDER = { active: 0, upcoming: 1, completed: 2, archived: 3 }
  const sorted = [...sessions].sort((a, b) => (ORDER[a.status] ?? 9) - (ORDER[b.status] ?? 9))

  return (
    <div>
      <PageHeader title="Academic Sessions"
        subtitle="Create and manage academic sessions for your department"
        action={<Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Session</Button>}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={2} />)}
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>No sessions yet.</p>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>Create first session</Button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {sorted.map(session => {
            const action = NEXT_STATUS[session.status]
            const isArchived = session.status === 'archived'
            return (
              <div key={session.id} style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${session.status === 'active' ? 'rgba(52,211,153,0.3)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-lg)', padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                {/* Status indicator bar */}
                <div style={{ width: 4, height: 48, borderRadius: 2, flexShrink: 0, background:
                  session.status === 'active'    ? 'var(--success)' :
                  session.status === 'upcoming'  ? 'var(--accent)'  :
                  session.status === 'completed' ? 'var(--text-muted)' : 'var(--border-default)'
                }} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {session.name}
                    </h3>
                    <Badge type="status" value={session.status} />
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border-subtle)', textTransform: 'capitalize' }}>
                      {session.semesterType}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {formatDate(session.startDate)} → {formatDate(session.endDate)}
                  </p>
                </div>

                {/* Status action button */}
                {action && !isArchived && (
                  <Button variant={action.variant} size="sm" loading={updating}
                    onClick={() => updateStatus({ id: session.id, status: action.next })}>
                    {action.label}
                  </Button>
                )}
                {isArchived && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Read-only</span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <CreateSessionModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}
