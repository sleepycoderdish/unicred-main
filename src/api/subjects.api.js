// src/api/subjects.api.js
import apiClient from '@/api/client'

/**
 * GET /api/courses
 * List all active courses for the department.
 * RESPONSE: { data: [{ id, courseCode, name, credits, subjectType, passingMarks, totalMarks, isActive }] }
 */
export async function fetchSubjects() {
  const res = await apiClient.get('/api/courses')
  return res.data
}

/**
 * GET /api/courses/:id
 */
export async function fetchSubjectById(id) {
  const res = await apiClient.get(`/api/courses/${id}`)
  return res.data
}

/**
 * POST /api/courses
 * BODY: { courseCode, name, credits?, subjectType?, passingMarks?, totalMarks? }
 * 409 if courseCode already exists in this department.
 */
export async function createSubject(payload) {
  const res = await apiClient.post('/api/courses', payload)
  return res.data
}

/**
 * PATCH /api/courses/:id
 */
export async function updateSubject(id, payload) {
  const res = await apiClient.patch(`/api/courses/${id}`, payload)
  return res.data
}

/**
 * PATCH /api/courses/:id/deactivate
 * Soft-deactivates the course. Disappears from all views.
 */
export async function deactivateSubject(id) {
  const res = await apiClient.patch(`/api/courses/${id}/deactivate`)
  return res.data
}

/**
 * GET /api/courses/offerings?sessionId=x
 * List course offerings for a session.
 * RESPONSE: { data: [{ id, sessionId, subjectId, semesterNumber, batchYear, subject: {...} }] }
 */
export async function fetchOfferings(sessionId) {
  const res = await apiClient.get('/api/courses/offerings', { params: { sessionId } })
  return res.data
}

/**
 * POST /api/courses/offerings
 * Offer a course in a session for a specific batch + semester.
 * BODY: { sessionId, subjectId, semesterNumber, batchYear }
 */
export async function createOffering(payload) {
  const res = await apiClient.post('/api/courses/offerings', payload)
  return res.data
}

/**
 * DELETE /api/courses/offerings/:id
 */
export async function deleteOffering(id) {
  const res = await apiClient.delete(`/api/courses/offerings/${id}`)
  return res.data
}