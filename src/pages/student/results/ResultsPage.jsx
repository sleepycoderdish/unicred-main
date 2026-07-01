// src/pages/student/results/ResultsPage.jsx
// Student views all published results.
// Grade F → red badge + "Apply for Reappear" button.
// Grades are backend-computed — never shown as user input.

import { useState } from 'react'
import { PageHeader }         from '@/components/ui/PageHeader'
import { Button }             from '@/components/ui/Button'
import { Modal }              from '@/components/ui/Modal'
import { CardLoader }         from '@/components/ui/Loader'
import { useStudentResults }  from '@/hooks/useStudentResults'
import { useApplyReappear, useMyReappearApplications } from '@/hooks/useReappear'
import { formatDate } from '@/utils/formatters'

// Grade badge — colour coded
function GradePill({ grade, isPassed }) {
  const color = grade === 'F'
    ? 'var(--danger)' : grade === 'O' || grade === 'A+'
    ? 'var(--success)' : 'var(--accent)'
  const bg = grade === 'F'
    ? 'var(--danger-light)' : grade === 'O' || grade === 'A+'
    ? 'var(--success-light)' : 'var(--accent-light)'

  return (
    <span style={{ padding: '3px 12px', borderRadius: 99, fontSize: '0.78rem',
      fontWeight: 700, background: bg, color }}>
      {grade ?? '—'}
    </span>
  )
}

// Apply reappear modal
//
// FIELD SHAPES (confirmed from the real GET /api/students/results response,
// a single row looks like this):
//   {
//     id, studentId, marks, grade, gradePoint, isPassed,
//     subjectId,              <-- flat field, this IS the subject's id
//     publicationId,
//     subject:     { name, courseCode, credits, ... },   <-- display only, NO id inside
//     publication: { sessionId, semesterNumber, publishedAt },  <-- sessionId is NESTED here
//     semester:    { semesterNumber, name },
//   }
// So: subjectId is a FLAT field on the row, but sessionId is only found
// NESTED inside `publication`. Mixing these up (e.g. reading
// `result.subject.id`, which doesn't exist, or `result.sessionId`, which
// also doesn't exist) silently produces `undefined`, so the backend never
// receives that field even though the button appears to work fine.
function ReappearModal({ result, isOpen, onClose }) {
  const [reason, setReason] = useState('')
  const { mutate: apply, isPending } = useApplyReappear()

  function handleSubmit(e) {
    e.preventDefault()
    // .trim() is a built-in string method that removes leading/trailing
    // whitespace. We use it so a reason of only spaces (or nothing) is
    // treated as empty and blocks submission.
    if (!reason.trim()) return
    // Guard against submitting with a missing id — if `result` itself, or
    // its subjectId/sessionId, somehow isn't set yet (e.g. modal opened
    // before its data loaded), stop here instead of sending a request the
    // backend will reject anyway.
    if (!result?.subjectId || !result?.publication?.sessionId) return
    apply({
      subjectId: result.subjectId,
      sessionId: result.publication.sessionId,
      reason:    reason.trim(),
    }, { onSuccess: () => { setReason(''); onClose() } })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Apply for Reappear" maxWidth={420}>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 14 }}>
        Subject: <strong style={{ color: 'var(--text-primary)' }}>{result?.subject?.name}</strong>
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)',
            display: 'block', marginBottom: 6 }}>
            Reason <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Explain why you are applying for reappear..."
            rows={4}
            style={{ width: '100%', background: 'var(--bg-input)',
              border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)', fontSize: '0.875rem', padding: '10px 12px',
              outline: 'none', resize: 'vertical', fontFamily: 'var(--font-sans)' }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e  => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>
        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="primary" loading={isPending} disabled={!reason.trim()}
            loadingText="Submitting...">Submit application</Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

export default function ResultsPage() {
  const [reappearTarget, setReappearTarget] = useState(null)
  const { data: results  = [], isLoading }  = useStudentResults()
  const { data: myApps   = [] }             = useMyReappearApplications()

  // Check if student already has a pending/approved application for a subject.
  // Same fix as ReappearModal above: applications also expose the subject's
  // id as a flat `subjectId` field, not nested under `subject.id` (the
  // nested `subject` object is display-only — just its name). Using the
  // wrong path meant this comparison was always `undefined === undefined`,
  // which is `true` for every row — so after applying to ONE subject, every
  // other failed subject would have wrongly shown "Applied" too.
  //
  // .some() is a built-in Array method: it checks each item in `myApps` and
  // returns true as soon as ANY of them satisfies the condition inside the
  // arrow function (false if none do, or if the array is empty).
  function hasApplication(subjectId) {
    return myApps.some(a => a.subjectId === subjectId && a.status !== 'rejected')
  }

  // Group results by semester
  const bySemester = results.reduce((acc, r) => {
    const key = r.publication?.semesterNumber ?? 'Unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(r)
    return acc
  }, {})

  return (
    <div>
      <PageHeader title="My Results"
        subtitle="Published semester results across all sessions"
      />

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2].map(i => <CardLoader key={i} lines={4} />)}
        </div>
      ) : results.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
          <p style={{ color: 'var(--text-muted)' }}>No published results yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {Object.entries(bySemester)
            .sort(([a],[b]) => Number(b) - Number(a))
            .map(([sem, rows]) => (
            <div key={sem}>
              <h3 style={{ margin: '0 0 12px', fontSize: '0.85rem', fontWeight: 700,
                color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Semester {sem}
              </h3>
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px auto',
                  gap: 16, padding: '10px 20px', background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border-subtle)' }}>
                  {['Subject', 'Marks', 'Grade', 'Credits', ''].map(h => (
                    <span key={h} style={{ fontSize: '0.72rem', fontWeight: 600,
                      color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                  ))}
                </div>
                {rows.map((r, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 80px auto',
                    gap: 16, padding: '14px 20px', alignItems: 'center',
                    borderBottom: i < rows.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {r.subject?.name}
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.subject?.courseCode}
                      </p>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {r.marks}
                    </p>
                    <GradePill grade={r.grade} isPassed={r.isPassed} />
                    <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {r.subject?.credits}
                    </p>
                    {/* Reappear button — only for failed subjects */}
                    <div>
                      {!r.isPassed && (
                        hasApplication(r.subjectId)
                          ? <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied</span>
                          : <Button variant="ghost" size="sm"
                              onClick={() => setReappearTarget(r)}>
                              Apply reappear
                            </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ReappearModal
        result={reappearTarget}
        isOpen={!!reappearTarget}
        onClose={() => setReappearTarget(null)}
      />
    </div>
  )
}
