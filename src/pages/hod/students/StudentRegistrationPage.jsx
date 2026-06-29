// src/pages/hod/students/StudentRegistrationPage.jsx
// ─────────────────────────────────────────────────────────────
// HOD registers students into an academic session (Section 7).
//
// Two tabs:
//   "Register" — HOD picks a session, semester, batch, then
//                selects students from the unregistered list
//                and submits to POST /studentReg/register-session
//
//   "Registered" — view all students already in a session,
//                  their status (active / completed / detained)
//                  and their rollNo / name.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { PageHeader }            from '@/components/ui/PageHeader'
import { Button }                from '@/components/ui/Button'
import { Select }                from '@/components/ui/Select'
import { Input }                 from '@/components/ui/Input'
import { Badge }                 from '@/components/ui/Badge'
import { CardLoader }            from '@/components/ui/Loader'
import { useSessions }           from '@/hooks/useSessions'
import { useStudentsInSession, useRegisterStudents } from '@/hooks/useStudentRegistration'
import { useFaculties }          from '@/hooks/useFaculties'

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
  // Comma-separated student IDs entered by HOD
  const [studentIdsRaw,  setStudentIdsRaw]  = useState('')
  const [errors,         setErrors]         = useState({})

  const { data: sessions = [] } = useSessions()
  const { mutate: register, isPending } = useRegisterStudents()

  // Only upcoming / active sessions can receive registrations
  const sessionOpts = sessions
    .filter(s => ['upcoming', 'active'].includes(s.status))
    .map(s => ({ value: String(s.id), label: s.name }))

  function validate() {
    const errs = {}
    if (!sessionId)                            errs.sessionId = 'Required'
    if (!semesterNumber || Number(semesterNumber) < 1 || Number(semesterNumber) > 8)
                                               errs.semesterNumber = '1–8 required'
    if (!batchYear || isNaN(Number(batchYear))) errs.batchYear = 'Required e.g. 2022'
    if (!studentIdsRaw.trim())                 errs.studentIds = 'Enter at least one student ID'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return

    // Parse the comma-separated IDs into an integer array
    // Removes whitespace and filters out empty entries
    const studentIds = studentIdsRaw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => !isNaN(n))

    if (!studentIds.length) {
      setErrors(p => ({ ...p, studentIds: 'No valid IDs found. Use comma-separated numbers.' }))
      return
    }

    // POST /api/studentReg/register-session
    register(
      {
        sessionId:      Number(sessionId),
        semesterNumber: Number(semesterNumber),
        batchYear:      Number(batchYear),
        studentIds,
      },
      {
        onSuccess: () => {
          // Reset form on success
          setStudentIdsRaw('')
          setErrors({})
        },
      }
    )
  }

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
        maxWidth:      560,
      }}>
        {/* Session */}
        <Select
          label="Academic Session"
          value={sessionId}
          onChange={e => { setSessionId(e.target.value); setErrors(p => ({ ...p, sessionId: '' })) }}
          options={sessionOpts}
          placeholder="Select session"
          error={errors.sessionId}
          required
        />

        {/* Semester + Batch row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label="Semester Number"
            value={semesterNumber}
            onChange={e => { setSemesterNumber(e.target.value); setErrors(p => ({ ...p, semesterNumber: '' })) }}
            placeholder="1 – 8"
            error={errors.semesterNumber}
            required
          />
          <Input
            label="Batch Year"
            value={batchYear}
            onChange={e => { setBatchYear(e.target.value); setErrors(p => ({ ...p, batchYear: '' })) }}
            placeholder="e.g. 2022"
            error={errors.batchYear}
            required
          />
        </div>

        {/* Student IDs */}
        <div>
          <label style={{
            fontSize: '0.8rem', fontWeight: 500,
            color: 'var(--text-secondary)', display: 'block', marginBottom: 6,
          }}>
            Student IDs <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea
            value={studentIdsRaw}
            onChange={e => { setStudentIdsRaw(e.target.value); setErrors(p => ({ ...p, studentIds: '' })) }}
            placeholder="Enter student IDs separated by commas&#10;e.g. 90001, 90002, 90003"
            rows={4}
            style={{
              width:        '100%',
              background:   'var(--bg-input)',
              border:       `1px solid ${errors.studentIds ? 'var(--danger)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-sm)',
              color:        'var(--text-primary)',
              fontSize:     '0.875rem',
              padding:      '10px 12px',
              outline:      'none',
              resize:       'vertical',
              fontFamily:   'var(--font-mono)',
              lineHeight:   1.6,
            }}
            onFocus={e => { if (!errors.studentIds) e.target.style.borderColor = 'var(--accent)' }}
            onBlur={e  => { if (!errors.studentIds) e.target.style.borderColor = 'var(--border-default)' }}
          />
          {errors.studentIds && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: 4 }}>
              {errors.studentIds}
            </p>
          )}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Subjects are auto-assigned from course offerings for the selected semester and batch.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          loading={isPending}
          loadingText="Registering..."
          style={{ alignSelf: 'flex-start' }}
        >
          Register students
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
    ...sessions.map(s => ({ value: String(s.id), label: s.name })),
  ]

  // Count by status
  const active    = registered.filter(r => r.status === 'active').length
  const detained  = registered.filter(r => r.status === 'detained').length
  const completed = registered.filter(r => r.status === 'completed').length

  return (
    <div>
      {/* Session filter */}
      <div style={{ marginBottom: 20, maxWidth: 300 }}>
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
