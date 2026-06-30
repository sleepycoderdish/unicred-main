// src/api/facultyAssignments.api.js
// ─────────────────────────────────────────────────────────────
// API calls related to faculty-subject assignments, from the
// student's perspective.
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

/**
 * GET /api/faculty-assignments/student/subject/:subjectId
 *
 * Returns the faculty member assigned to teach a given subject in
 * the student's current active session.
 *
 * Possible responses:
 *   200 → { data: { id, faculty: { id, designation, officeLocation,
 *                    user: { id, name, email, bio, profilePhotoUrl,
 *                            linkedinUrl, githubUrl, portfolioUrl } } } }
 *   404 → no faculty assigned yet, OR student has no active session
 *
 * The 404 case is handled gracefully in useFacultyForSubject —
 * it is not a bug, just means the HOD hasn't assigned anyone yet.
 *
 * @param {number|string} subjectId - the course/subject id
 */
export async function fetchFacultyForSubject(subjectId) {
  const res = await apiClient.get(`/api/faculty-assignments/student/subject/${subjectId}`)
  return res.data
}
