// src/pages/faculty/assessments/AssessmentsPage.jsx
// Faculty uploads internal assessment marks per subject per student.
// Assessment types: quiz | assignment | midterm | lab | viva | practical
// Constraint: marks cannot exceed maxMarks — validated before sending.

import { useState }              from 'react'
import { PageHeader }            from '@/components/ui/PageHeader'
import { Button }                from '@/components/ui/Button'
import { Input }                 from '@/components/ui/Input'
import { Select }                from '@/components/ui/Select'
import { Modal }                 from '@/components/ui/Modal'
import { Badge }                 from '@/components/ui/Badge'
import { CardLoader }            from '@/components/ui/Loader'
import { useMyAssignments, useSessionStudents, useCreateAssessment } from '@/hooks/useAssignments'

const ASSESSMENT_TYPES = [
  { value: 'quiz',       label: 'Quiz' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'midterm',    label: 'Mid-Term' },
  { value: 'lab',        label: 'Lab' },
  { value: 'viva',       label: 'Viva' },
  { value: 'practical',  label: 'Practical' },
]

// Color per assessment type
const TYPE_COLOR = {
  quiz:       '#6366f1',
  assignment: '#38bdf8',
  midterm:    '#fbbf24',
  lab:        '#34d399',
  viva:       '#a78bfa',
  practical:  '#fb923c',
}

// ── Add assessment modal ──────────────────────────────────────
function AddAssessmentModal({ assignment, isOpen, onClose }) {
  const [form, setForm] = useState({
    assessmentType: '',
    title:          '',
    maxMarks:       '',
  })
  // One mark per student: { [studentId]: markValue }
  const [marks,    setMarks]    = useState({})
  const [errors,   setErrors]   = useState({})
  const [formErr,  setFormErr]  = useState('')

  const { data: roster = [], isLoading: rosterLoading } = useSessionStudents(assignment?.sessionId)
  const { mutate: create, isPending } = useCreateAssessment()

  // Filter roster to matching batch + semester
  const students = roster.filter(r =>
    r.batchYear      === assignment?.batchYear &&
    r.semesterNumber === assignment?.semesterNumber
  )

  function validate() {
    if (!form.assessmentType) { setFormErr('Select assessment type.'); return false }
    if (!form.title.trim())   { setFormErr('Title is required.'); return false }
    if (!form.maxMarks || Number(form.maxMarks) <= 0) { setFormErr('Max marks must be > 0.'); return false }

    const errs = {}
    students.forEach(s => {
      const sid = s.student?.id
      const val = Number(marks[sid])
      if (marks[sid] === undefined || marks[sid] === '') errs[sid] = 'Required'
      else if (val < 0 || val > Number(form.maxMarks)) errs[sid] = `0–${form.maxMarks}`
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    setFormErr('')
    if (!validate()) return

    // Submit one record per student
    const calls = students.map(s =>
      create({
        subjectId:      assignment.subjectId,
        sessionId:      assignment.sessionId,
        studentId:      s.student?.id,
        assessmentType: form.assessmentType,
        title:          form.title.trim(),
        marks:          Number(marks[s.student?.id]),
        maxMarks:       Number(form.maxMarks),
      })
    )

    // Close after last mutation settles
    Promise.allSettled(calls).then(onClose)
  }

  function handleClose() {
    setForm({ assessmentType: '', title: '', maxMarks: '' })
    setMarks({})
    setErrors({})
    setFormErr('')
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Assessment — ${assignment?.subject?.name}`} maxWidth={540}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
        <Select label="Assessment type" value={form.assessmentType}
          onChange={e => { setForm(p => ({ ...p, assessmentType: e.target.value })); setFormErr('') }}
          options={ASSESSMENT_TYPES} placeholder="Select type" required />

        <Input label="Title" value={form.title}
          onChange={e => { setForm(p => ({ ...p, title: e.target.value })); setFormErr('') }}
          placeholder="e.g. Mid Term Exam 1" required />

        <Input label="Max marks" value={form.maxMarks}
          onChange={e => { setForm(p => ({ ...p, maxMarks: e.target.value })); setFormErr('') }}
          placeholder="e.g. 25" required />

        {formErr && <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--danger)' }}>{formErr}</p>}
      </div>

      {/* Student mark inputs */}
      {rosterLoading ? <CardLoader lines={3} /> : students.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>
          No students found for this subject.
        </p>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 4 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px',
            gap: 12, padding: '8px 14px', background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>Student</span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marks</span>
          </div>
          <div style={{ maxHeight: 240, overflowY: 'auto' }}>
            {students.map((s, i) => {
              const sid = s.student?.id
              return (
                <div key={sid} style={{ display: 'grid', gridTemplateColumns: '1fr 120px',
                  gap: 12, padding: '10px 14px', alignItems: 'center',
                  borderBottom: i < students.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {s.student?.user?.name}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {s.student?.rollNo}
                    </p>
                  </div>
                  <div>
                    <input
                      type="number" min={0} max={form.maxMarks || undefined}
                      value={marks[sid] ?? ''}
                      onChange={e => { setMarks(p => ({ ...p, [sid]: e.target.value })); setErrors(p => ({ ...p, [sid]: '' })) }}
                      placeholder="0"
                      style={{ width: '100%', background: 'var(--bg-input)',
                        border: `1px solid ${errors[sid] ? 'var(--danger)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        fontSize: '0.875rem', padding: '6px 10px', outline: 'none' }}
                      onFocus={e => { if (!errors[sid]) e.target.style.borderColor = 'var(--accent)' }}
                      onBlur={e  => { if (!errors[sid]) e.target.style.borderColor = 'var(--border-default)' }}
                    />
                    {errors[sid] && (
                      <p style={{ margin: '2px 0 0', fontSize: '0.68rem', color: 'var(--danger)' }}>{errors[sid]}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <Modal.Footer>
        <Button variant="ghost" onClick={handleClose} disabled={isPending}>Cancel</Button>
        <Button variant="primary" loading={isPending} loadingText="Saving..."
          disabled={students.length === 0} onClick={handleSubmit}>
          Save marks
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AssessmentsPage() {
  const [selected, setSelected] = useState(null) // assignment object for modal
  const { data: assignments = [], isLoading } = useMyAssignments()

  // Only show active/upcoming session assignments
  const activeAssignments = assignments.filter(a =>
    ['active', 'upcoming'].includes(a.session?.status)
  )

  return (
    <div>
      <PageHeader
        title="Internal Assessments"
        subtitle="Upload quiz, midterm, lab and other assessment marks"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={1} />)}
        </div>
      ) : activeAssignments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px',
          background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No active subjects available for assessment upload.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto',
            gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)',
            borderBottom: '1px solid var(--border-subtle)' }}>
            {['Subject', 'Semester / Batch', 'Session', ''].map(h => (
              <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
            ))}
          </div>

          {activeAssignments.map((a, idx) => (
            <div key={a.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto',
              gap: 16, padding: '14px 20px', alignItems: 'center',
              borderBottom: idx < activeAssignments.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                  {a.subject?.name}
                </p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 1 }}>
                  {a.subject?.courseCode}
                </p>
              </div>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Sem {a.semesterNumber} · {a.batchYear}
              </p>
              <Badge type="status" value={a.session?.status} />
              <Button variant="accent" size="sm" onClick={() => setSelected(a)}>
                + Add Assessment
              </Button>
            </div>
          ))}
        </div>
      )}

      <AddAssessmentModal
        assignment={selected}
        isOpen={!!selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
