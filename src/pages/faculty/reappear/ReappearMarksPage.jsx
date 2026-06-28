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

export default function ReappearMarksPage() {
  const { data: students = [], isLoading } = useActiveReappearStudents()
  const { mutate: submitReappear, isPending } = useSubmitReappearMarks()

  // Group by subjectId so each subject gets its own submit action
  const grouped = students.reduce((acc, s) => {
    const key = s.subject?.id
    if (!acc[key]) acc[key] = { subject: s.subject, publication: s.publication, students: [] }
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

  function handleSubmit(subjectId, totalMarks, publicationId) {
    const subjectMarks = marks[subjectId] ?? {}
    const errs = {}
    const group = grouped[subjectId]

    group.students.forEach(s => {
      const sid = s.student?.id
      const val = Number(subjectMarks[sid])
      if (!subjectMarks[sid] && subjectMarks[sid] !== 0) errs[`${subjectId}_${sid}`] = 'Required'
      else if (val < 0 || val > totalMarks) errs[`${subjectId}_${sid}`] = `0–${totalMarks}`
    })

    if (Object.keys(errs).length) { setErrors(errs); return }

    submitReappear({
      publicationId,
      subjectId,
      marks: group.students.map(s => ({
        studentId: s.student?.id,
        marks:     Number(subjectMarks[s.student?.id]),
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
            <div key={group.subject?.id} style={{ background: 'var(--bg-surface)',
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
                const sid = s.student?.id
                const errKey = `${group.subject?.id}_${sid}`
                return (
                  <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 16,
                    padding: '13px 20px',
                    borderBottom: i < group.students.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <p style={{ flex: 1, margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      {s.student?.user?.name}
                    </p>
                    <div style={{ width: 160 }}>
                      <input
                        type="number" min={0} max={group.subject?.totalMarks}
                        value={marks[group.subject?.id]?.[sid] ?? ''}
                        onChange={e => setMark(group.subject?.id, sid, e.target.value)}
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
                  onClick={() => handleSubmit(group.subject?.id, group.subject?.totalMarks, group.publication?.id)}>
                  Submit reappear marks
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
