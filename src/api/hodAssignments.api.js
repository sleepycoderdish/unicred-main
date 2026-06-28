// src/api/hodAssignments.api.js
import apiClient from '@/api/client'

/**
 * GET /api/faculty-assignments
 * All assignments for the HOD's department.
 * RESPONSE: { data: [{ id, sessionId, facultyId, subjectId, semesterNumber, batchYear,
 *                      faculty: { user: { name, email } }, subject: { name, courseCode },
 *                      session: { name, status } }] }
 */
export async function fetchHodAssignments() {
  const res = await apiClient.get('/api/faculty-assignments')
  return res.data
}

/**
 * POST /api/faculty-assignments
 * Assign a faculty to an offered course.
 * BODY: { sessionId, facultyId, subjectId, semesterNumber, batchYear }
 * 409 if this exact assignment already exists.
 */
export async function createHodAssignment(payload) {
  const res = await apiClient.post('/api/faculty-assignments', payload)
  return res.data
}

/**
 * DELETE /api/faculty-assignments/:id
 */
export async function deleteHodAssignment(id) {
  const res = await apiClient.delete(`/api/faculty-assignments/${id}`)
  return res.data
}