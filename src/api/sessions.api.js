// src/api/sessions.api.js
import apiClient from '@/api/client'

/**
 * GET /api/academic-sessions
 * List all sessions for the school.
 * RESPONSE: { data: [{ id, name, academicYear, semesterType, startDate, endDate, status, departmentId }] }
 */
export async function fetchSessions() {
  const res = await apiClient.get('/api/academic-sessions')
  return res.data
}

/**
 * GET /api/academic-sessions/:id
 */
export async function fetchSessionById(id) {
  const res = await apiClient.get(`/api/academic-sessions/${id}`)
  return res.data
}

/**
 * POST /api/academic-sessions
 * BODY: { name, academicYear, semesterType: 'odd'|'even', startDate, endDate }
 * RESPONSE: 201 { data: { id, name, semesterType, status: 'upcoming', departmentId } }
 */
export async function createSession(payload) {
  const res = await apiClient.post('/api/academic-sessions', payload)
  return res.data
}

/**
 * PATCH /api/academic-sessions/:id
 * Update session details (not archived).
 */
export async function updateSession(id, payload) {
  const res = await apiClient.patch(`/api/academic-sessions/${id}`, payload)
  return res.data
}

/**
 * PATCH /api/academic-sessions/:id/status
 * Move session forward: upcoming → active → completed → archived
 * BODY: { status: 'active'|'completed'|'archived' }
 */
export async function updateSessionStatus(id, status) {
  const res = await apiClient.patch(`/api/academic-sessions/${id}/status`, { status })
  return res.data
}