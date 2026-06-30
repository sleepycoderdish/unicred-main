// src/pages/hod/results/PublicationsPage.jsx
// HOD page: Create and manage result publications.
// Status machine: draft → under_review → frozen → published
// frozen → under_review is allowed (unfreeze for corrections).

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader }            from '@/components/ui/PageHeader'
import { Button }                from '@/components/ui/Button'
import { Modal }                 from '@/components/ui/Modal'
import { Input }                 from '@/components/ui/Input'
import { Select }                from '@/components/ui/Select'
import { CardLoader }            from '@/components/ui/Loader'
import { Badge }                 from '@/components/ui/Badge'
import { usePublications, useCreatePublication, useUpdatePublicationStatus } from '@/hooks/useResultPublications'
import { useSessions }           from '@/hooks/useSessions'
import { formatDate, sessionLabel } from '@/utils/formatters'

// Status → next allowed action
const STATUS_ACTIONS = {
  draft:        [{ label: 'Send for Review', next: 'under_review', variant: 'accent' }],
  under_review: [{ label: 'Freeze',          next: 'frozen',       variant: 'accent' }],
  frozen:       [
    { label: 'Publish',   next: 'published',    variant: 'primary' },
    { label: 'Unfreeze',  next: 'under_review', variant: 'ghost' },
  ],
  published:    [], // No further actions
}

// Progress bar for completion %
function ProgressBar({ pct }) {
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 99, height: 6, overflow: 'hidden', marginTop: 8 }}>
      <div style={{
        height: '100%', borderRadius: 99, transition: 'width 0.4s ease',
        width: `${pct}%`,
        background: pct === 100 ? 'var(--success)' : pct > 50 ? 'var(--accent)' : 'var(--warning)',
      }} />
    </div>
  )
}

// Create publication modal
function CreatePublicationModal({ isOpen, onClose }) {
  const [form, setForm] = useState({ sessionId: '', batchYear: '', semesterNumber: '' })
  const [errors, setErrors] = useState({})
  const { mutate: create, isPending } = useCreatePublication()

  // Load the HOD's sessions so they can pick one by NAME instead of typing a
  // numeric id (which the HOD has no way of knowing). We send the underlying
  // sessionId to the backend, but the HOD only ever sees the readable label.
  const { data: sessions = [] } = useSessions()

  // A publication is for a semester that has finished, so allow any session
  // that is not archived to be chosen here. (Archived sessions are read-only.)
  const sessionOpts = sessions
    .filter(s => s.status !== 'archived')
    .map(s => ({ value: String(s.id), label: sessionLabel(s) }))

  function handleSubmit(e) {
    e.preventDefault()
    // Simple presence checks — show inline errors instead of silently doing nothing.
    const errs = {}
    if (!form.sessionId)      errs.sessionId = 'Select a session'
    if (!form.batchYear)      errs.batchYear = 'Required e.g. 2022'
    if (!form.semesterNumber || Number(form.semesterNumber) < 1 || Number(form.semesterNumber) > 8)
      errs.semesterNumber = '1–8 required'
    setErrors(errs)
    if (Object.keys(errs).length) return

    create({
      sessionId:      Number(form.sessionId),
      batchYear:      Number(form.batchYear),
      semesterNumber: Number(form.semesterNumber),
    }, { onSuccess: () => { setForm({ sessionId: '', batchYear: '', semesterNumber: '' }); onClose() } })
  }

  const field = (label, key, placeholder) => (
    <Input label={label} value={form[key]} error={errors[key]}
      onChange={e => { setForm(p => ({ ...p, [key]: e.target.value })); setErrors(p => ({ ...p, [key]: '' })) }}
      placeholder={placeholder} required />
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Result Publication" maxWidth={420}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Session is chosen from a dropdown (name + academic year), not typed. */}
          <Select
            label="Session"
            value={form.sessionId}
            onChange={e => { setForm(p => ({ ...p, sessionId: e.target.value })); setErrors(p => ({ ...p, sessionId: '' })) }}
            options={sessionOpts}
            placeholder={sessionOpts.length ? 'Select a session' : 'No sessions available'}
            error={errors.sessionId}
            required
          />
          {field('Batch Year', 'batchYear', 'e.g. 2022')}
          {field('Semester Number', 'semesterNumber', '1 – 8')}
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Creating...">Create</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default function PublicationsPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const navigate = useNavigate()
  const { data: publications = [], isLoading } = usePublications()
  const { mutate: updateStatus, isPending: updating } = useUpdatePublicationStatus()

  return (
    <div>
      <PageHeader title="Result Publications"
        subtitle="Manage semester result compilations for your department"
        action={<Button variant="primary" onClick={() => setCreateOpen(true)}>+ New Publication</Button>}
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={2} />)}
        </div>
      ) : publications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No publications yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {publications.map(pub => {
            const actions = STATUS_ACTIONS[pub.status] ?? []
            const canPublish = pub.status === 'frozen' && pub.completionPercent === 100

            return (
              <div key={pub.id} style={{ background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)',
                padding: '18px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  {/* Left info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Semester {pub.semesterNumber} · Batch {pub.batchYear}
                      </h3>
                      <Badge type="status" value={pub.status} />
                    </div>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {pub.submittedCount ?? 0} of {pub.totalSubjects ?? 0} subjects submitted
                    </p>
                    <ProgressBar pct={pub.completionPercent ?? 0} />
                    <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {pub.completionPercent ?? 0}% complete
                    </p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    <Button variant="ghost" size="sm"
                      onClick={() => navigate(`/hod/results/${pub.id}`)}>
                      Review →
                    </Button>

                    {actions.map(action => (
                      <Button key={action.next}
                        variant={action.variant}
                        size="sm"
                        loading={updating}
                        // Publish disabled until 100% complete
                        disabled={action.next === 'published' && !canPublish}
                        onClick={() => updateStatus({ id: pub.id, status: action.next })}
                        title={action.next === 'published' && !canPublish
                          ? 'All faculty must submit before publishing'
                          : undefined}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreatePublicationModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  )
}