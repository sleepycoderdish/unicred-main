// src/pages/hod/assignments/HodAssignmentsPage.jsx
// ─────────────────────────────────────────────────────────────
// HOD manages faculty–subject assignments for each session/batch.
//
// API Contract §6:
//   POST   /faculty-assignments        → create
//   GET    /faculty-assignments        → list all in dept
//   PATCH  /faculty-assignments/:id   → modify (change faculty/subject/batch)
//   DELETE /faculty-assignments/:id   → remove
//
// A faculty member can only upload marks for subjects they are
// explicitly assigned to — assignments are the authorisation gate.
// ─────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'
import { PageHeader }       from '@/components/ui/PageHeader'
import { Button }           from '@/components/ui/Button'
import { Select }           from '@/components/ui/Select'
import { Input }            from '@/components/ui/Input'
import { Modal }            from '@/components/ui/Modal'
import { Badge }            from '@/components/ui/Badge'
import { CardLoader }       from '@/components/ui/Loader'
import {
  useHodAssignments,
  useCreateHodAssignment,
  usePatchHodAssignment,
  useDeleteHodAssignment,
} from '@/hooks/useHodAssignments'
import { useSessions }  from '@/hooks/useSessions'
import { useSubjects }  from '@/hooks/useSubjects'
import { useFaculties, useMyDepartmentId } from '@/hooks/useFaculties'
import { sessionLabel } from '@/utils/formatters'

// ── Shared form fields used by both Create and Edit modals ────
function AssignmentForm({ form, setForm, sessions, subjects, faculties }) {
  const sessionOpts = sessions
    .filter(s => ['upcoming', 'active'].includes(s.status))
    .map(s => ({ value: String(s.id), label: s.name }))

  const subjectOpts = subjects.map(s => ({
    value: String(s.id),
    label: `${s.courseCode} — ${s.name}`,
  }))

  // IMPORTANT: the backend expects the Faculty.id here (not the userId).
  // Sending a userId causes "Faculty member not found in this school".
  const facultyOpts = faculties.map(f => ({
    value: String(f.id),
    label: `${f.user.name} (${f.designation})`,
  }))

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Select
        label="Session"
        value={form.sessionId}
        onChange={e => set('sessionId', e.target.value)}
        options={sessionOpts}
        placeholder="Select session"
        required
      />
      <Select
        label="Faculty"
        value={form.facultyId}
        onChange={e => set('facultyId', e.target.value)}
        options={facultyOpts}
        placeholder="Select faculty member"
        required
      />
      <Select
        label="Subject"
        value={form.subjectId}
        onChange={e => set('subjectId', e.target.value)}
        options={subjectOpts}
        placeholder="Select subject"
        required
      />
      {/* Semester and Batch on one row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Input
          label="Semester"
          value={form.semesterNumber}
          onChange={e => set('semesterNumber', e.target.value)}
          placeholder="1–8"
          required
        />
        <Input
          label="Batch year"
          value={form.batchYear}
          onChange={e => set('batchYear', e.target.value)}
          placeholder="e.g. 2022"
          required
        />
      </div>
    </div>
  )
}

// ── Create assignment modal ───────────────────────────────────
// POST /api/faculty-assignments
function CreateAssignmentModal({ isOpen, onClose }) {
  const EMPTY = { sessionId: '', facultyId: '', subjectId: '', semesterNumber: '', batchYear: '' }
  const [form, setForm] = useState(EMPTY)

  const { data: sessions  = [] } = useSessions()
  const { data: subjects  = [] } = useSubjects()
  // Resolve the HOD's department to filter faculty (Issue 3). We try the HOD's
  // own faculty record first; if that isn't available, we fall back to the
  // department of the SELECTED session (sessions belong to the HOD's dept).
  const myDeptId = useMyDepartmentId()
  const selectedSession = sessions.find(s => String(s.id) === String(form.sessionId))
  const deptId = myDeptId ?? selectedSession?.departmentId ?? null
  const { data: faculties = [] } = useFaculties(deptId)
  const { mutate: create, isPending } = useCreateHodAssignment()

  function handleSubmit(e) {
    e.preventDefault()
    const { sessionId, facultyId, subjectId, semesterNumber, batchYear } = form
    if (!sessionId || !facultyId || !subjectId || !semesterNumber || !batchYear) return

    create(
      {
        sessionId:      Number(sessionId),
        facultyId:      Number(facultyId),
        subjectId:      Number(subjectId),
        semesterNumber: Number(semesterNumber),
        batchYear:      Number(batchYear),
      },
      { onSuccess: () => { setForm(EMPTY); onClose() } }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Faculty to Subject" maxWidth={460}>
      <form onSubmit={handleSubmit} noValidate>
        <AssignmentForm
          form={form} setForm={setForm}
          sessions={sessions} subjects={subjects} faculties={faculties}
        />
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Assigning...">
            Assign
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Edit assignment modal ─────────────────────────────────────
// PATCH /api/faculty-assignments/:id
// Pre-fills form with current assignment values so HOD only changes
// what needs changing (e.g. swap faculty, correct the batch year).
function EditAssignmentModal({ assignment, isOpen, onClose }) {
  const [form, setForm] = useState({
    sessionId:      String(assignment?.sessionId      ?? ''),
    facultyId:      String(assignment?.facultyId      ?? ''),
    subjectId:      String(assignment?.subjectId      ?? ''),
    semesterNumber: String(assignment?.semesterNumber ?? ''),
    batchYear:      String(assignment?.batchYear      ?? ''),
  })

  const { data: sessions  = [] } = useSessions()
  const { data: subjects  = [] } = useSubjects()
  // Same department resolution as the create modal (Issue 3).
  const myDeptId = useMyDepartmentId()
  const selectedSession = sessions.find(s => String(s.id) === String(form.sessionId))
  const deptId = myDeptId ?? selectedSession?.departmentId ?? null
  const { data: faculties = [] } = useFaculties(deptId)
  const { mutate: patch, isPending } = usePatchHodAssignment()

  function handleSubmit(e) {
    e.preventDefault()
    const { sessionId, facultyId, subjectId, semesterNumber, batchYear } = form
    if (!sessionId || !facultyId || !subjectId || !semesterNumber || !batchYear) return

    // PATCH sends only fields that changed — here we send all for simplicity
    patch(
      {
        id:             assignment.id,
        sessionId:      Number(sessionId),
        facultyId:      Number(facultyId),
        subjectId:      Number(subjectId),
        semesterNumber: Number(semesterNumber),
        batchYear:      Number(batchYear),
      },
      { onSuccess: onClose }
    )
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Assignment" maxWidth={460}>
      <form onSubmit={handleSubmit} noValidate>
        <AssignmentForm
          form={form} setForm={setForm}
          sessions={sessions} subjects={subjects} faculties={faculties}
        />
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} loadingText="Saving...">
            Save changes
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function HodAssignmentsPage() {
  const [createOpen,    setCreateOpen]    = useState(false)
  const [editTarget,    setEditTarget]    = useState(null)   // assignment object
  const { data: sessions    = [] }              = useSessions()
  // The list endpoint needs a session, so default to the first one and let the
  // user switch. We never send "all sessions" (the backend would 400).
  const [sessionFilter, setSessionFilter] = useState('')
  useEffect(() => {
    if (!sessionFilter && sessions.length) setSessionFilter(String(sessions[0].id))
  }, [sessions, sessionFilter])

  const { data: assignments = [], isLoading }   = useHodAssignments(sessionFilter)
  const { mutate: remove, isPending: removing } = useDeleteHodAssignment()

  // Sessions are listed by name; there is no "all" option because the backend
  // returns assignments per session.
  const sessionOpts = sessions.map(s => ({ value: String(s.id), label: sessionLabel(s) }))

  // Server already returns this session's rows; no extra client filter needed.
  const filtered = assignments

  return (
    <div>
      <PageHeader
        title="Faculty Assignments"
        subtitle="Assign faculty members to subjects for each session and batch"
        action={
          <Button variant="primary" onClick={() => setCreateOpen(true)}>
            + Assign Faculty
          </Button>
        }
      />

      {/* Session filter */}
      <div style={{ marginBottom: 20, maxWidth: 280 }}>
        <Select
          label="Filter by session"
          value={sessionFilter}
          onChange={e => setSessionFilter(e.target.value)}
          options={sessionOpts}
        />
      </div>

      {/* Assignment list */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '64px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
        }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
            No assignments{sessionFilter ? ' for this session' : ''} yet.
          </p>
          <Button variant="accent" size="sm" onClick={() => setCreateOpen(true)}>
            Create first assignment
          </Button>
        </div>
      ) : (
        <div style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow:     'hidden',
        }}>
          {/* Column headers */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '2fr 2fr 1fr 80px 80px auto',
            gap:                  12,
            padding:             '10px 18px',
            background:          'var(--bg-elevated)',
            borderBottom:        '1px solid var(--border-subtle)',
          }}>
            {['Faculty', 'Subject', 'Session', 'Sem', 'Batch', ''].map(h => (
              <span key={h} style={{
                fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((a, idx) => (
            <div
              key={a.id}
              style={{
                display:             'grid',
                gridTemplateColumns: '2fr 2fr 1fr 80px 80px auto',
                gap:                  12,
                padding:             '13px 18px',
                alignItems:          'center',
                borderBottom: idx < filtered.length - 1
                  ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Faculty name + email */}
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem',
                  color: 'var(--text-primary)' }}>
                  {a.faculty?.user?.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {a.faculty?.user?.email}
                </p>
              </div>

              {/* Subject name + code */}
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem',
                  color: 'var(--text-primary)' }}>
                  {a.subject?.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem',
                  color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {a.subject?.courseCode}
                </p>
              </div>

              {/* Session status badge */}
              <Badge type="status" value={a.session?.status} />

              {/* Semester */}
              <p style={{ margin: 0, fontSize: '0.82rem',
                color: 'var(--text-secondary)', textAlign: 'center' }}>
                Sem {a.semesterNumber}
              </p>

              {/* Batch year */}
              <p style={{ margin: 0, fontSize: '0.82rem',
                color: 'var(--text-secondary)', textAlign: 'center' }}>
                {a.batchYear}
              </p>

              {/* Edit + Remove actions */}
              <div style={{ display: 'flex', gap: 6 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditTarget(a)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  loading={removing}
                  onClick={() => remove(a.id)}
                  style={{ color: 'var(--danger)' }}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateAssignmentModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />

      {/* Edit modal — only mounts when a target is selected */}
      {editTarget && (
        <EditAssignmentModal
          assignment={editTarget}
          isOpen={!!editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}