// src/api/results.api.js
// Result publications, mark upload, and HOD review endpoints.
// Publication lifecycle: draft → under_review → frozen → published
// frozen can go back to under_review (HOD unfreeze).

import apiClient from '@/api/client'

// ── Publications (HOD) ────────────────────────────────────────

/**
 * POST /api/results/publications
 * Create a result publication for a batch+semester in a session.
 * Auto-generates one submission tracker per assigned faculty.
 * BODY: { sessionId: int, batchYear: int, semesterNumber: int }
 * RESPONSE: 201 { data: { id, status: "draft", semesterNumber, batchYear } }
 * 409 if publication already exists for this session+dept+batch+semester.
 */
export async function createPublication(payload) {
  const res = await apiClient.post('/api/results/publications', payload)
  return res.data
}

/**
 * GET /api/results/publications
 * List department publications each with completion %.
 * RESPONSE: { data: [{ id, status, submittedCount, totalSubjects, completionPercent }] }
 */
export async function fetchPublications() {
  const res = await apiClient.get('/api/results/publications')
  return res.data
}

/**
 * GET /api/results/publications/:id
 * One publication with full submission breakdown.
 * RESPONSE: { data: { id, status, completionPercent, facultyResultSubmissions: [...] } }
 */
export async function fetchPublicationById(id) {
  const res = await apiClient.get(`/api/results/publications/${id}`)
  return res.data
}

/**
 * PATCH /api/results/publications/:id/status
 * Advance publication lifecycle. Triggers CGPA computation on publish.
 * BODY: { status: "under_review" | "frozen" | "published" }
 * Backend enforces legal transitions only.
 * Publishing requires ALL subjects submitted (400 if not).
 */
export async function updatePublicationStatus(id, status) {
  const res = await apiClient.patch(`/api/results/publications/${id}/status`, { status })
  return res.data
}

// ── HOD review endpoints ──────────────────────────────────────

/**
 * GET /api/results/publications/:id/summary
 * Full result table for HOD review — registrations, marks, offerings.
 */
export async function fetchPublicationSummary(id) {
  const res = await apiClient.get(`/api/results/publications/${id}/summary`)
  return res.data
}

/**
 * GET /api/results/publications/:id/pending
 * Faculty who haven't submitted yet (chase-up list).
 * RESPONSE: { data: [{ faculty: { user: { name, email } }, subject: { name, courseCode } }] }
 */
export async function fetchPendingSubmissions(id) {
  const res = await apiClient.get(`/api/results/publications/${id}/pending`)
  return res.data
}

/**
 * GET /api/results/publications/:id/failures
 * Students who failed at least one subject (grade F).
 */
export async function fetchFailedStudents(id) {
  const res = await apiClient.get(`/api/results/publications/${id}/failures`)
  return res.data
}

// ── Faculty mark upload ───────────────────────────────────────

/**
 * GET /api/results/my-subjects
 * Subjects the faculty can submit marks for (draft/under_review only).
 * RESPONSE: { data: [{ isSubmitted, publication: { id, status, batchYear, semesterNumber },
 *                      subject: { id, name, totalMarks, passingMarks } }] }
 */
export async function fetchMySubjects() {
  const res = await apiClient.get('/api/results/my-subjects')
  return res.data
}

/**
 * POST /api/results/submit
 * Bulk upload marks for a subject. Grades auto-computed by backend.
 * BODY: { publicationId: int, subjectId: int, marks: [{ studentId, marks }] }
 * Frontend must validate: 0 ≤ each mark ≤ subject.totalMarks
 * RESPONSE: { data: { submitted, allSubmitted, isReappear } }
 */
export async function submitMarks(payload) {
  const res = await apiClient.post('/api/results/submit', payload)
  return res.data
}

/**
 * GET /api/results/submissions/:subjectId?publicationId=X
 * View own submitted marks for a subject.
 * publicationId is REQUIRED as a query param.
 * RESPONSE: { data: [{ marks, grade, gradePoint, student: { user: { name } } }] }
 */
export async function fetchSubmissions(subjectId, publicationId) {
  const res = await apiClient.get(`/api/results/submissions/${subjectId}`, {
    params: { publicationId },
  })
  return res.data
}

/**
 * PATCH /api/results/submissions/:subjectId
 * Edit submitted marks (draft/under_review only).
 * BODY: { publicationId: int, marks: [{ studentId, marks }] }
 */
export async function editSubmissions(subjectId, payload) {
  const res = await apiClient.patch(`/api/results/submissions/${subjectId}`, payload)
  return res.data
}

/**
 * GET /api/results/roster?publicationId=X&subjectId=Y
 * Full student roster for a subject's mark-entry screen.
 * Returns ALL registered students with their existing mark attached (null
 * if not yet submitted) — independent of whether any marks have been uploaded.
 * RESPONSE: { data: [{ student: { id, rollNo, user: { name, email } },
 *                      marks, grade, gradePoint }] }
 */
export async function fetchRoster(subjectId, publicationId) {
  const res = await apiClient.get('/api/results/roster', {
    params: { subjectId, publicationId },
  })
  return res.data
}

/**
 * POST /api/results/submit-reappear
 * Upload reappear marks. ONLY allowed on a PUBLISHED publication.
 * Recomputes CGPA and notifies the student.
 * BODY: { publicationId: int, subjectId: int, marks: [{ studentId, marks }] }
 */
export async function submitReappearMarks(payload) {
  const res = await apiClient.post('/api/results/submit-reappear', payload)
  return res.data
}