// src/pages/faculty/reappear/ReappearMarksPage.jsx
// Faculty uploads marks for approved reappear students.
// Allowed ONLY on a PUBLISHED publication.
// Only students from /reappear/active-students can be submitted.

import { useState } from 'react'
import { PageHeader }             from '@/components/ui/PageHeader'
import { Button }                 from '@/components/ui/Button'
import { CardLoader }             from '@/components/ui/Loader'
import { useActiveReappearStudents } from '@/hooks/useReappear'
import { useSubmitReappearMarks }    from '@/hooks/useResultPublications'

// FIELD SHAPE (confirmed from the real GET /api/reappear/active-students
// response) — each row looks like:
//   {
//     id,                 <-- this row's OWN id (the reappear application)
//     studentId, subjectId,           <-- FLAT foreign-key fields
//     publicationId,                  <-- resolved server-side; NULL if no
//                                          PUBLISHED publication exists yet
//                                          for this student's dept/batch/
//                                          semester + this application's
//                                          session (see unicred-backend's
//                                          reappear.repository.js)
//     student: { id, rollNo, departmentId, batchYear, user: { name, email } },
//     subject: { id, courseCode, name, totalMarks, passingMarks },
//   }
// publicationId can legitimately be null (no matching published publication
// yet) — we must not silently submit `undefined`/`null` for it, so the
// Submit button is disabled and shows a message when it's missing.
export default function ReappearMarksPage() {
  const { data: students = [], isLoading } = useActiveReappearStudents()
  const { mutate: submitReappear, isPending } = useSubmitReappearMarks()

  // Group by subjectId so each subject gets its own submit action.
  // .reduce() is a built-in Array method: it walks through `students` one at
  // a time, building up a single accumulator value (`acc`, an object here)
  // by running the callback on each item and returning the updated
  // accumulator for the next step. We use it here to bucket the flat list of
  // students into { [subjectId]: { subject, subjectId, publicationId, students } }.
  const grouped = students.reduce((acc, s) => {
    const key = s.subjectId
    if (!acc[key]) {
      acc[key] = {
        subject:       s.subject,       // display-only nested object (name, totalMarks, ...)
        subjectId:     s.subjectId,     // flat id — used when submitting
        publicationId: s.publicationId, // flat id — used when submitting (bug fix: was reading the non-existent s.publication)
        students:      [],
      }
    }
    acc[key].students.push(s)
    return acc
  }, {})

  // Local marks: { [subjectId]: { [studentId]: markValue } }
  const [marks, setMarks] = useState({})
  const [errors, setErrors] = useState({})

  function setMark(subjectId, studentId, value) {
    setMarks(p => ({
      ...p,
      [subjectId]: { ...(p[subjectId] ?? {}), [studentId]: value },
    }))
    setErrors(p => ({ ...p, [`${subjectId}_${studentId}`]: '' }))
  }

  // subjectId/totalMarks/publicationId are passed in from the button's
  // onClick below, sourced from the group object (see grouping fix above).
  function handleSubmit(subjectId, totalMarks, publicationId) {
    const subjectMarks = marks[subjectId] ?? {}
    const errs = {}
    const group = grouped[subjectId]

    group.students.forEach(s => {
      const sid = s.studentId
      const val = Number(subjectMarks[sid])
      if (!subjectMarks[sid] && subjectMarks[sid] !== 0) errs[`${subjectId}_${sid}`] = 'Required'
      else if (val < 0 || val > totalMarks) errs[`${subjectId}_${sid}`] = `0–${totalMarks}`
    })

    if (Object.keys(errs).length) { setErrors(errs); return }

    // publicationId can be null if no published publication exists yet for
    // this student's dept/batch/semester — don't send a request the backend
    // will reject anyway; the disabled Submit button (below) should already
    // prevent reaching this, but guard here too in case that ever changes.
    if (!publicationId) return

    submitReappear({
      publicationId,
      subjectId,
      marks: group.students.map(s => ({
        studentId: s.studentId,
        marks:     Number(subjectMarks[s.studentId]),
      })),
    })
  }

  return (
    <div>
      <PageHeader title="Reappear Marks"
        subtitle="Submit marks for approved reappear students"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2].map(i => <CardLoader key={i} lines={3} />)}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            No approved reappear students for your subjects.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.values(grouped).map(group => (
            <div key={group.subjectId} style={{ background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>

              {/* Subject header */}
              <div style={{ padding: '14px 20px', background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-subtle)' }}>
                <h3 style={{ margin: 0, fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {group.subject?.name}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  Max marks: {group.subject?.totalMarks} · Publication: published
                </p>
              </div>

              {/* Student rows */}
              {group.students.map((s, i) => {
                // sid: the STUDENT's id — used to key marks state and to
                // build the marks[] payload (must match `studentId` the
                // backend expects).
                const sid = s.studentId
                const errKey = `${group.subjectId}_${sid}`
                return (
                  // key={s.id}: this row's OWN unique id (the reappear
                  // tracker record), not a foreign key like studentId. A
                  // foreign key can repeat (e.g. if a student ever had more
                  // than one tracker row); a row's own id can't — that's
                  // what fixed the "unique key prop" console warning.
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 16,
                    padding: '13px 20px',
                    borderBottom: i < group.students.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <p style={{ flex: 1, margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {s.student?.user?.name}
                    </p>
                    <div style={{ width: 160 }}>
                      <input
                        type="number" min={0} max={group.subject?.totalMarks}
                        value={marks[group.subjectId]?.[sid] ?? ''}
                        onChange={e => setMark(group.subjectId, sid, e.target.value)}
                        placeholder="Enter marks"
                        style={{ width: '100%', background: 'var(--bg-input)',
                          border: `1px solid ${errors[errKey] ? 'var(--danger)' : 'var(--border-default)'}`,
                          borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)',
                          fontSize: '0.875rem', padding: '7px 12px', outline: 'none' }}
                        onFocus={e => { if (!errors[errKey]) e.target.style.borderColor = 'var(--accent)' }}
                        onBlur={e  => { if (!errors[errKey]) e.target.style.borderColor = 'var(--border-default)' }}
                      />
                      {errors[errKey] && (
                        <p style={{ margin: '3px 0 0', fontSize: '0.72rem', color: 'var(--danger)' }}>{errors[errKey]}</p>
                      )}
                    </div>
                  </div>
                )
              })}

              {/* Submit per subject */}
              <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                <Button variant="primary" size="sm" loading={isPending} loadingText="Submitting..."
                  disabled={!group.publicationId}
                  onClick={() => handleSubmit(group.subjectId, group.subject?.totalMarks, group.publicationId)}>
                  Submit reappear marks
                </Button>
                {!group.publicationId && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    No published result publication yet for this subject/semester — marks can't be submitted until one exists.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
