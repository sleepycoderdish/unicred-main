// src/api/reappear.api.js
// Reappear flow: Student applies → HOD approves → Faculty uploads marks.
// Order is strict — each step unlocks the next.

import apiClient from '@/api/client'

// ── Student ───────────────────────────────────────────────────

/**
 * POST /api/reappear/apply
 * Student applies for reappear on a failed subject.
 * BODY: { subjectId: int, sessionId: int, reason: string }
 * 409 if a pending/approved application already exists for this subject+session.
 * Backend rejects if subject was passed or result not published.
 */
export async function applyReappear(payload) {
  const res = await apiClient.post('/api/reappear/apply', payload)
  return res.data
}

/**
 * GET /api/reappear/my-applications
 * Student's own reappear applications with status.
 * RESPONSE: { data: [{ id, status, reason, subject: { name }, session: { name } }] }
 */
export async function fetchMyApplications() {
  const res = await apiClient.get('/api/reappear/my-applications')
  return res.data
}

/**
 * DELETE /api/reappear/applications/:id
 * Withdraw a PENDING application only.
 * 400 if already approved or rejected.
 */
export async function withdrawApplication(id) {
  const res = await apiClient.delete(`/api/reappear/applications/${id}`)
  return res.data
}

// ── HOD ──────────────────────────────────────────────────────

/**
 * GET /api/reappear/department?status=pending
 * All applications in the HOD's department.
 * @param {string} [status] - 'pending' | 'approved' | 'rejected' | undefined (all)
 * RESPONSE: { data: [{ id, status, reason, student: {...}, subject: {...}, session: {...} }] }
 */
export async function fetchDepartmentApplications(status) {
  const res = await apiClient.get('/api/reappear/department', {
    params: status ? { status } : {},
  })
  return res.data
}

/**
 * PATCH /api/reappear/applications/:id/approve
 * Approve application. Invalidates original mark + recomputes CGPA.
 * BODY: { comment?: string }
 */
export async function approveApplication(id, comment) {
  const res = await apiClient.patch(`/api/reappear/applications/${id}/approve`, { comment })
  return res.data
}

/**
 * PATCH /api/reappear/applications/:id/reject
 * Reject with a mandatory comment.
 * BODY: { comment: string } — 400 if blank
 */
export async function rejectApplication(id, comment) {
  const res = await apiClient.patch(`/api/reappear/applications/${id}/reject`, { comment })
  return res.data
}

// ── Faculty ──────────────────────────────────────────────────

/**
 * GET /api/reappear/active-students
 * Approved reappear students for the faculty's assigned subjects.
 * RESPONSE: { data: [{ id, studentId, subjectId, publicationId, status,
 *                      student: { id, rollNo, departmentId, batchYear, user: { name, email } },
 *                      subject: { id, courseCode, name, totalMarks, passingMarks } }] }
 * publicationId is resolved server-side from the matching PUBLISHED
 * ResultPublication (by session/department/batch/semester) — it is null if
 * no published publication exists yet.
 * Empty array = no approved applications yet for this faculty's subjects.
 */
export async function fetchActiveReappearStudents() {
  const res = await apiClient.get('/api/reappear/active-students')
  return res.data
}