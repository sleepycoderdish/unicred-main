// src/pages/hod/reappear/ReappearReviewPage.jsx
// HOD reviews reappear applications from students in their department.
// Approve → invalidates original mark + triggers CGPA recompute.
// Reject → mandatory comment required.

import { useState } from 'react'
import { PageHeader }  from '@/components/ui/PageHeader'
import { Button }      from '@/components/ui/Button'
import { Modal }       from '@/components/ui/Modal'
import { Badge }       from '@/components/ui/Badge'
import { CardLoader }  from '@/components/ui/Loader'
import { useDepartmentApplications, useApproveApplication, useRejectApplication } from '@/hooks/useReappear'

const STATUS_FILTERS = ['pending', 'approved', 'rejected']

// Reject modal — comment is mandatory
function RejectModal({ application, isOpen, onClose }) {
  const [comment, setComment] = useState('')
  const { mutate: reject, isPending } = useRejectApplication()

  function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    reject({ id: application.id, comment: comment.trim() }, {
      onSuccess: () => { setComment(''); onClose() },
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Reject Application" maxWidth={420}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Student: <strong style={{ color: 'var(--text-primary)' }}>{application?.student?.user?.name}</strong>
        <br />Subject: {application?.subject?.name}
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            Reason for rejection <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Provide a reason..."
            rows={4}
            style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem',
              padding: '10px 12px', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="danger" loading={isPending} disabled={!comment.trim()}
            loadingText="Rejecting...">Reject</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default function ReappearReviewPage() {
  const [statusFilter, setStatusFilter] = useState('pending')
  const [rejectTarget, setRejectTarget] = useState(null)

  const { data: applications = [], isLoading } = useDepartmentApplications(statusFilter)
  const { mutate: approve, isPending: approving } = useApproveApplication()

  return (
    <div>
      <PageHeader title="Reappear Applications"
        subtitle="Review and action reappear requests from students"
      />

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        {STATUS_FILTERS.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: '8px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.875rem', fontWeight: 600, textTransform: 'capitalize',
              color: statusFilter === s ? 'var(--text-accent)' : 'var(--text-muted)',
              borderBottom: statusFilter === s ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom: -1 }}>
            {s}
          </button>
        ))}
      </div>

      {/* Application list */}
      <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <CardLoader key={i} lines={2} />)}
          </div>
        ) : applications.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            No {statusFilter} applications.
          </p>
        ) : (
          applications.map((app, idx) => (
            <div key={app.id}
              style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px',
                borderBottom: idx < applications.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                    {app.student?.user?.name}
                  </p>
                  <Badge type="status" value={app.status} />
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {app.subject?.name} · {app.session?.name}
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)',
                  background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)',
                  padding: '6px 10px', display: 'inline-block' }}>
                  "{app.reason}"
                </p>
                {app.hodComment && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    HOD comment: {app.hodComment}
                  </p>
                )}
              </div>

              {/* Actions — only for pending */}
              {app.status === 'pending' && (
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <Button variant="accent" size="sm" loading={approving}
                    onClick={() => approve({ id: app.id })}>
                    Approve
                  </Button>
                  <Button variant="ghost" size="sm"
                    onClick={() => setRejectTarget(app)}>
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <RejectModal
        application={rejectTarget}
        isOpen={!!rejectTarget}
        onClose={() => setRejectTarget(null)}
      />
    </div>
  )
}
