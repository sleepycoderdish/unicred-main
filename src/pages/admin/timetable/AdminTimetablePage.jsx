// src/pages/admin/timetable/AdminTimetablePage.jsx
// ─────────────────────────────────────────────────────────────
// Component: AdminTimetablePage (default export)
// Renders: the admin's timetable approval queue — a status-filterable
//          list of timetables submitted by HODs, each expandable to
//          show its slots, with Approve / Return-with-comment actions
//          on submitted timetables.
// Props: none — reads everything via hooks (route is /admin/timetables).
//
// All network calls go through src/api/timetable.api.js via the hooks
// in src/hooks/useTimetable.js — never call apiClient directly here.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { PageHeader }  from '@/components/ui/PageHeader'
import { Button }      from '@/components/ui/Button'
import { Modal }       from '@/components/ui/Modal'
import { FilterTabs }  from '@/components/ui/FilterTabs'
import { CardLoader }  from '@/components/ui/Loader'
import {
  useAdminTimetables,
  useApproveTimetable,
  useReturnTimetable,
} from '@/hooks/useTimetable'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const STATUS_COLOR = { draft: 'var(--text-muted)', submitted: 'var(--accent-sky)', returned: 'var(--danger)', approved: 'var(--success)' }
const STATUS_TABS = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'approved',  label: 'Approved' },
  { value: 'returned',  label: 'Returned' },
  { value: 'all',       label: 'All' },
]

// ── Return modal ──────────────────────────────────────────────
// Component: ReturnModal
// Renders: a modal form requiring a mandatory comment before a
//          submitted timetable is sent back to its HOD.
// Props: timetable: object|null, isOpen: boolean, onClose: () => void
function ReturnModal({ timetable, isOpen, onClose }) {
  const [comment, setComment] = useState('')
  const { mutate: returnTt, isPending } = useReturnTimetable()

  // handleSubmit — blocks submission until a non-empty comment is entered
  // (validation error is implicit: the Return button stays disabled).
  // Params: e — the form submit event
  // Returns: void
  function handleSubmit(e) {
    e.preventDefault()
    if (!comment.trim()) return
    returnTt(
      { id: timetable.id, comment: comment.trim() },
      { onSuccess: () => { setComment(''); onClose() } }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Timetable" maxWidth={420}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Semester {timetable?.semesterNumber} · Batch {timetable?.batchYear}
        <br />Department: {timetable?.department?.name}
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
            What needs to change? <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Explain what the HOD should fix..."
            rows={4}
            style={{
              width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: '0.875rem',
              padding: '10px 12px', outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
          />
          {/* Validation error shown before/instead of submitting */}
          {!comment.trim() && (
            <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              A comment is required so the HOD knows what to fix.
            </p>
          )}
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="danger" loading={isPending} disabled={!comment.trim()} loadingText="Returning...">
            Return
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
// AdminTimetablePage — top-level route component for /admin/timetables.
// Params: none (props)
// Returns: JSX
export default function AdminTimetablePage() {
  const [statusFilter, setStatusFilter] = useState('submitted')
  const [returnTarget, setReturnTarget] = useState(null) // timetable object being returned
  const { data: timetables = [], isLoading } = useAdminTimetables()
  const { mutate: approve, isPending: approving } = useApproveTimetable()

  // .filter() — narrows the full queue down to the tab currently selected.
  const visible = statusFilter === 'all' ? timetables : timetables.filter((tt) => tt.status === statusFilter)

  return (
    <div>
      <PageHeader title="Timetable Approvals" subtitle="Review timetables submitted by HODs across departments" />

      <FilterTabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />

      {isLoading ? (
        // Loading spinner/skeleton shown while GET /api/admin/timetables is in flight.
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map((i) => <CardLoader key={i} lines={3} />)}
        </div>
      ) : visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No {statusFilter === 'all' ? '' : statusFilter} timetables.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* .map() — renders one card per timetable in the current filter. */}
          {visible.map((tt) => (
            <div key={tt.id} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {tt.department?.name ?? 'Department'} · Semester {tt.semesterNumber} · Batch {tt.batchYear}
                    </h3>
                    <span
                      style={{
                        fontSize: '0.75rem', fontWeight: 600, padding: '2px 10px', borderRadius: 99,
                        background: `${STATUS_COLOR[tt.status]}18`, border: `1px solid ${STATUS_COLOR[tt.status]}35`,
                        color: STATUS_COLOR[tt.status],
                      }}
                    >
                      {tt.status}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {tt.slots?.length ?? 0} slots · {tt.session?.name}
                  </p>
                </div>
                {tt.status === 'submitted' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Button variant="accent" size="sm" loading={approving} onClick={() => approve(tt.id)}>Approve</Button>
                    <Button variant="ghost" size="sm" onClick={() => setReturnTarget(tt)}>Return</Button>
                  </div>
                )}
              </div>

              {/* Comment left on a previously returned timetable */}
              {tt.adminComment && tt.status === 'returned' && (
                <div style={{ padding: '10px 20px', background: 'rgba(248,113,113,0.06)', borderBottom: '1px solid var(--border-subtle)' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--danger)' }}>
                    <strong>Your comment:</strong> {tt.adminComment}
                  </p>
                </div>
              )}

              {/* Slots table — read-only for admin */}
              {(tt.slots ?? []).length > 0 && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '100px 2fr 2fr 60px 80px 80px', gap: 10, padding: '8px 20px', background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)' }}>
                    {['Day', 'Subject', 'Faculty', 'Type', 'Start', 'End'].map((h) => (
                      <span key={h} style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                    ))}
                  </div>
                  {/* [...tt.slots].sort() — copies before sorting so query cache data is never mutated in place. */}
                  {[...tt.slots].sort((a, b) => a.dayOfWeek - b.dayOfWeek || (a.startTime > b.startTime ? 1 : -1)).map((slot, i) => (
                    <div
                      key={slot.id}
                      style={{ display: 'grid', gridTemplateColumns: '100px 2fr 2fr 60px 80px 80px', gap: 10, padding: '11px 20px', alignItems: 'center', borderBottom: i < tt.slots.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}
                    >
                      <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{DAYS[slot.dayOfWeek - 1]}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.subject?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slot.faculty?.user?.name}</p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{slot.slotType}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{slot.startTime}</p>
                      <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{slot.endTime}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <ReturnModal timetable={returnTarget} isOpen={!!returnTarget} onClose={() => setReturnTarget(null)} />
    </div>
  )
}
