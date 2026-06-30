// src/pages/hod/students/StudentRegistrationPage.jsx
// ─────────────────────────────────────────────────────────────
// HOD registers students into an academic session (Section 7).
//
// Two tabs:
//   "Register"   — HOD picks a session + semester + batch, the page then
//                  FETCHES the matching students of their department and shows
//                  them as a checkbox list (with roll number + name) plus a
//                  "Select all" option. The HOD ticks who to register.
//                  We send the underlying studentIds to the backend (which is
//                  exactly what the backend expects) — the HOD never has to
//                  know or type a database id.
//
//   "Registered" — view all students already in a session, with their status
//                  (active / completed / detained), rollNo and name.
// ─────────────────────────────────────────────────────────────

import { useState, useMemo } from 'react'
import { PageHeader }            from '@/components/ui/PageHeader'
import { Button }                from '@/components/ui/Button'
import { Select }                from '@/components/ui/Select'
import { Input }                 from '@/components/ui/Input'
import { CardLoader }            from '@/components/ui/Loader'
import { useSessions }           from '@/hooks/useSessions'
import { useStudentsInSession, useRegisterStudents } from '@/hooks/useStudentRegistration'
import { useStudents }           from '@/hooks/useStudents'
import { useMyDepartmentId }     from '@/hooks/useFaculties'
import { sessionLabel }          from '@/utils/formatters'

// Status badge colours for registration status
const REG_STATUS_COLOR = {
  active:    { bg: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  color: 'var(--success)' },
  completed: { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  color: 'var(--text-accent)' },
  detained:  { bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', color: 'var(--danger)' },
}

function RegStatusChip({ status }) {
  const s = REG_STATUS_COLOR[status] ?? REG_STATUS_COLOR.active
  return (
    <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: '0.72rem',
      fontWeight: 600, background: s.bg, border: `1px solid ${s.border}`, color: s.color,
      textTransform: 'capitalize' }}>
      {status}
    </span>
  )
}

// ── Register tab ──────────────────────────────────────────────
function RegisterTab() {
  const [sessionId,      setSessionId]      = useState('')
  const [semesterNumber, setSemesterNumber] = useState('')
  const [batchYear,      setBatchYear]      = useState('')
  // Set of selected student DB ids (the value the backend wants).
  // Using a Set makes toggling and "select all" simple and fast.
  const [selectedIds,    setSelectedIds]    = useState(() => new Set())
  const [errors,         setErrors]         = useState({})

  const { data: sessions = [] } = useSessions()
  const { mutate: register, isPending } = useRegisterStudents()

  // The HOD's own department, used to scope the student list.
  const myDeptId = useMyDepartmentId()

  // Fetch the candidate students once batch + semester are filled in.
  // The hook stays disabled until both are present.
  const {
    data: students = [],
    isLoading: studentsLoading,
    isError:   studentsError,
  } = useStudents({
    departmentId:   myDeptId ?? undefined,
    batchYear:      batchYear ? Number(batchYear) : undefined,
    semesterNumber: semesterNumber ? Number(semesterNumber) : undefined,
  })

  // Only upcoming / active sessions can receive registrations.
  // Labels show the session NAME + academic year (never the numeric id).
  const sessionOpts = sessions
    .filter(s => ['upcoming', 'active'].includes(s.status))
    .map(s => ({ value: String(s.id), label: sessionLabel(s) }))

  // Are all currently listed students selected? (drives the "select all" box)
  const allSelected = students.length > 0 && students.every(st => selectedIds.has(st.id))

  // Toggle a single student in/out of the selection set.
  function toggleOne(studentId) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(studentId)) next.delete(studentId)
      else next.add(studentId)
      return next
    })
  }

  // Select-all / clear-all toggle for the whole visible list.
  function toggleAll() {
    setSelectedIds(prev => {
      if (students.every(st => prev.has(st.id))) {
        // Everything is selected → clear all.
        return new Set()
      }
      // Otherwise select every listed student.
      return new Set(students.map(st => st.id))
    })
  }

  function validate() {
    const errs = {}
    if (!sessionId)                              errs.sessionId = 'Required'
    if (!semesterNumber || Number(semesterNumber) < 1 || Number(semesterNumber) > 8)
                                                 errs.semesterNumber = '1–8 required'
    if (!batchYear || isNaN(Number(batchYear)))  errs.batchYear = 'Required e.g. 2022'
    if (selectedIds.size === 0)                  errs.students = 'Select at least one student'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    // POST /api/studentReg/register-session — backend receives the studentIds.
    register(
      {
        sessionId:      Number(sessionId),
        semesterNumber: Number(semesterNumber),
        batchYear:      Number(batchYear),
        studentIds:     Array.from(selectedIds),
      },
      {
        onSuccess: () => {
          // Clear the selection after a successful registration.
          setSelectedIds(new Set())
          setErrors({})
        },
      }
    )
  }

  // Should we show the student list area? Only once batch + semester are set.
  const readyToList = !!batchYear && !!semesterNumber

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{
        background:   'var(--bg-surface)',
        border:       '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding:      '24px',
        display:      'flex',
        flexDirection:'column',
        gap:           18,
        maxWidth:      640,
      }}>
        {/* Session (by name + year) */}
        <Select
          label="Academic Session"
          value={sessionId}
          onChange={e => { setSessionId(e.target.value); setErrors(p => ({ ...p, sessionId: '' })) }}
          options={sessionOpts}
          placeholder={sessionOpts.length ? 'Select session' : 'No upcoming/active sessions'}
          error={errors.sessionId}
          required
        />

        {/* Semester + Batch row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="Semester Number"
            value={semesterNumber}
            onChange={e => { setSemesterNumber(e.target.value); setSelectedIds(new Set()); setErrors(p => ({ ...p, semesterNumber: '' })) }}
            placeholder="1 – 8"
            error={errors.semesterNumber}
            required
          />
          <Input
            label="Batch Year"
            value={batchYear}
            onChange={e => { setBatchYear(e.target.value); setSelectedIds(new Set()); setErrors(p => ({ ...p, batchYear: '' })) }}
            placeholder="e.g. 2022"
            error={errors.batchYear}
            required
          />
        </div>

        {/* ── Student picker ──────────────────────────────── */}
        <div>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
            Students <span style={{ color: 'var(--danger)' }}>*</span>
          </label>

          {!readyToList ? (
            // Prompt before batch + semester are chosen.
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Enter a semester and batch year to load students from your department.
              </p>
            </div>
          ) : studentsLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1, 2, 3].map(i => <CardLoader key={i} lines={1} />)}
            </div>
          ) : studentsError ? (
            <div style={{ padding: '16px', border: '1px solid var(--danger)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--danger)' }}>
                Could not load students. Please check the student-list endpoint.
              </p>
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', border: '1px dashed var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No students found for this batch and semester.
              </p>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {/* Select-all header row */}
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border-subtle)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)',
              }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                Select all ({selectedIds.size}/{students.length} selected)
              </label>

              {/* One row per student */}
              <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                {students.map((st, idx) => (
                  <label
                    key={st.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                      borderBottom: idx < students.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(st.id)}
                      onChange={() => toggleOne(st.id)}
                    />
                    {/* Roll number — what humans recognise students by */}
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-accent)', fontWeight: 700, minWidth: 90 }}>
                      {st.rollNo ?? '—'}
                    </span>
                    {/* Name + email */}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                        {st.user?.name ?? '—'}
                      </span>
                      <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        {st.user?.email ?? ''}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {errors.students && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 6 }}>{errors.students}</p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
            Subjects are auto-assigned from course offerings for the selected semester and batch.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          loadingText="Registering..."
          disabled={selectedIds.size === 0}
          style={{ alignSelf: 'flex-start' }}
        >
          Register {selectedIds.size > 0 ? `${selectedIds.size} ` : ''}student{selectedIds.size === 1 ? '' : 's'}
        </Button>
      </div>
    </form>
  )
}

// ── Registered tab ────────────────────────────────────────────
function RegisteredTab() {
  const [sessionId, setSessionId] = useState('')

  const { data: sessions   = [] }               = useSessions()
  const { data: registered = [], isLoading }    = useStudentsInSession(sessionId ? Number(sessionId) : null)

  const sessionOpts = [
    { value: '', label: 'All sessions' },
    ...sessions.map(s => ({ value: String(s.id), label: sessionLabel(s) })),
  ]

  // Count by status
  const active    = registered.filter(r => r.status === 'active').length
  const detained  = registered.filter(r => r.status === 'detained').length
  const completed = registered.filter(r => r.status === 'completed').length

  return (
    <div>
      {/* Session filter */}
      <div style={{ marginBottom: 20, maxWidth: 320 }}>
        <Select
          label="Filter by session"
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
          options={sessionOpts}
        />
      </div>

      {/* Quick stats row — shown only when a session is selected */}
      {sessionId && !isLoading && registered.length > 0 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {[
            { label: 'Total',     value: registered.length, color: 'var(--text-accent)' },
            { label: 'Active',    value: active,    color: 'var(--success)' },
            { label: 'Detained',  value: detained,  color: 'var(--danger)' },
            { label: 'Completed', value: completed, color: 'var(--text-muted)' },
          ].map(k => (
            <div key={k.label} style={{
              background:   'var(--bg-surface)',
              border:       '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding:      '12px 18px',
            }}>
              <p style={{ margin: 0, fontSize: '0.68rem', color: 'var(--text-muted)',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                {k.label}
              </p>
              <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800,
                color: k.color, fontFamily: 'var(--font-display)' }}>
                {k.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Student list */}
      {!sessionId ? (
        <div style={{ textAlign: 'center', padding: '48px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select a session to view registered students.</p>
        </div>
      ) : isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
        </div>
      ) : registered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No students registered in this session yet.</p>
        </div>
      ) : (
        <div style={{
          background:   'var(--bg-surface)',
          border:       '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow:     'hidden',
        }}>
          {/* Table header */}
          <div style={{
            display:             'grid',
            gridTemplateColumns: '100px 2fr 1fr 80px 80px',
            gap:                  16,
            padding:             '10px 20px',
            background:          'var(--bg-elevated)',
            borderBottom:        '1px solid var(--border-subtle)',
          }}>
            {['Roll No', 'Student', 'Email', 'Semester', 'Status'].map(h => (
              <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          {registered.map((reg, idx) => (
            <div
              key={reg.id}
              style={{
                display:             'grid',
                gridTemplateColumns: '100px 2fr 1fr 80px 80px',
                gap:                  16,
                padding:             '13px 20px',
                alignItems:          'center',
                borderBottom: idx < registered.length - 1
                  ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Roll number */}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                color: 'var(--text-accent)', fontWeight: 700 }}>
                {reg.student?.rollNo ?? '—'}
              </span>

              {/* Name */}
              <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem',
                color: 'var(--text-primary)' }}>
                {reg.student?.user?.name ?? '—'}
              </p>

              {/* Email */}
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {reg.student?.user?.email ?? '—'}
              </p>

              {/* Semester */}
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)',
                textAlign: 'center' }}>
                Sem {reg.semesterNumber}
              </p>

              {/* Registration status */}
              <RegStatusChip status={reg.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function StudentRegistrationPage() {
  const [tab, setTab] = useState('register')

  return (
    <div>
      <PageHeader
        title="Student Registration"
        subtitle="Register students into academic sessions and view enrollment"
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24,
        borderBottom: '1px solid var(--border-subtle)' }}>
        {[
          { key: 'register',   label: 'Register Students' },
          { key: 'registered', label: 'View Registered'   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding:      '8px 18px',
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              fontSize:      '0.875rem',
              fontWeight:     600,
              color:          tab === t.key ? 'var(--text-accent)' : 'var(--text-muted)',
              borderBottom:   tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              marginBottom:  -1,
              transition:    'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'register'   && <RegisterTab />}
      {tab === 'registered' && <RegisteredTab />}
    </div>
  )
}