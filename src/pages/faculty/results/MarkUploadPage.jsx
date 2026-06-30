// src/pages/faculty/results/MarkUploadPage.jsx
// Faculty uploads marks for their assigned subjects.
// Step 1: See list of subjects with submission status.
// Step 2: Click a subject → enter marks for each student.
// Marks are validated: 0 ≤ mark ≤ subject.totalMarks before sending.

import { useState } from 'react'
import { PageHeader }   from '@/components/ui/PageHeader'
import { Button }       from '@/components/ui/Button'
import { Badge }        from '@/components/ui/Badge'
import { CardLoader }   from '@/components/ui/Loader'
import { useMySubjects, useRoster, useSubmitMarks, useEditSubmissions } from '@/hooks/useResultPublications'

// ── Mark entry table for one subject ─────────────────────────
function MarkEntry({ assignment, onBack }) {
  const { publication, subject } = assignment

  // useRoster returns ALL registered students, with marks: null if not yet
  // submitted. This replaces useSubmissions which only returned rows that
  // already had marks — causing "No students" when no marks had been entered yet.
  const { data: roster = [], isLoading: rosterLoading } = useRoster(subject.id, publication.id)
  const { mutate: submit, isPending: submitting } = useSubmitMarks()
  const { mutate: edit,   isPending: editing }    = useEditSubmissions()

  // Local marks state: { [studentId]: markValue }
  const [marks, setMarks] = useState(() => {
    const init = {}
    roster.forEach(r => { init[r.student?.id] = String(r.marks ?? '') })
    return init
  })
  const [errors, setErrors] = useState({})

  // Derive edit mode from the roster: if any student already has a mark we're
  // editing, not submitting for the first time. More reliable than
  // assignment.isSubmitted which can lag behind the actual data.
  const isEditing = roster.some(r => r.marks != null)
  const isLocked  = ['frozen','published'].includes(publication.status)

  function validate() {
    const errs = {}
    Object.entries(marks).forEach(([sid, val]) => {
      const n = Number(val)
      if (val === '' || isNaN(n)) errs[sid] = 'Required'
      else if (n < 0 || n > subject.totalMarks) errs[sid] = `0–${subject.totalMarks}`
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    const payload = {
      publicationId: publication.id,
      subjectId:     subject.id,
      marks: Object.entries(marks).map(([studentId, m]) => ({
        studentId: Number(studentId),
        marks:     Number(m),
      })),
    }
    if (isEditing) {
      edit({ subjectId: subject.id, ...payload }, { onSuccess: onBack })
    } else {
      submit(payload, { onSuccess: onBack })
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <Button variant="ghost" size="sm" onClick={onBack}>← Back</Button>
        <div>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {subject.name}
          </h2>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {subject.courseCode} · Total: {subject.totalMarks} · Passing: {subject.passingMarks}
          </p>
        </div>
        <Badge type="status" value={publication.status} />
      </div>

      {rosterLoading ? (
        <CardLoader lines={3} />
      ) : roster.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', padding: '32px 0', textAlign: 'center' }}>
          No students registered for this subject yet.
        </p>
      ) : (
        <>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px',
              gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-subtle)' }}>
              {['Student', `Marks (max ${subject.totalMarks})`, 'Grade'].map(h => (
                <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                  color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
              ))}
            </div>

            {roster.map((row, idx) => {
              const sid = row.student?.id
              return (
                <div key={sid} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 80px',
                  gap: 16, padding: '12px 20px', alignItems: 'center',
                  borderBottom: idx < roster.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {row.student?.user?.name}
                  </p>
                  <div>
                    <input
                      type="number" min={0} max={subject.totalMarks}
                      value={marks[sid] ?? ''}
                      onChange={e => {
                        setMarks(p => ({ ...p, [sid]: e.target.value }))
                        setErrors(p => ({ ...p, [sid]: '' }))
                      }}
                      disabled={isLocked}
                      placeholder="Enter marks"
                      style={{ width: '100%', background: 'var(--bg-input)',
                        border: `1px solid ${errors[sid] ? 'var(--danger)' : 'var(--border-default)'}`,
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                        fontSize: '0.875rem', padding: '7px 12px', outline: 'none' }}
                      onFocus={e => { if (!errors[sid]) e.target.style.borderColor = 'var(--accent)' }}
                      onBlur={e  => { if (!errors[sid]) e.target.style.borderColor = 'var(--border-default)' }}
                    />
                    {errors[sid] && (
                      <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--danger)' }}>{errors[sid]}</p>
                    )}
                  </div>
                  {/* Grade is backend-computed — display if already submitted */}
                  <span style={{ fontSize: '0.82rem', fontWeight: 700,
                    color: row.grade === 'F' ? 'var(--danger)' : 'var(--success)' }}>
                    {row.grade ?? '—'}
                  </span>
                </div>
              )
            })}
          </div>

          {!isLocked && (
            <Button variant="primary" loading={submitting || editing}
              loadingText="Saving..." onClick={handleSubmit}>
              {isEditing ? 'Update marks' : 'Submit marks'}
            </Button>
          )}

          {isLocked && (
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Publication is {publication.status} — marks cannot be edited.
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function MarkUploadPage() {
  const [selected, setSelected] = useState(null) // assignment object
  const { data: subjects = [], isLoading } = useMySubjects()

  if (selected) return <MarkEntry assignment={selected} onBack={() => setSelected(null)} />

  return (
    <div>
      <PageHeader title="Upload Marks"
        subtitle="Submit marks for your assigned subjects"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <CardLoader key={i} lines={2} />)}
        </div>
      ) : subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No subjects available for mark submission.</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          {subjects.map((s, idx) => {
            const locked = ['frozen','published'].includes(s.publication?.status)
            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                borderBottom: idx < subjects.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background 0.12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {s.subject?.name}
                    </p>
                    <Badge type="status" value={s.isSubmitted ? 'active' : 'unassigned'}
                      label={s.isSubmitted ? 'Submitted' : 'Pending'} />
                    <Badge type="status" value={s.publication?.status} />
                  </div>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    Sem {s.publication?.semesterNumber} · Batch {s.publication?.batchYear} · Max {s.subject?.totalMarks}
                  </p>
                </div>
                <Button variant={s.isSubmitted ? 'ghost' : 'accent'} size="sm"
                  onClick={() => setSelected(s)} disabled={locked && !s.isSubmitted}>
                  {locked ? 'View' : s.isSubmitted ? 'Edit' : 'Enter Marks'}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
