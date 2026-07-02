// src/api/timetable.api.js
// ─────────────────────────────────────────────────────────────
// All timetable-related HTTP calls, grouped by role.
// Every function here just wraps one backend endpoint and returns
// the raw axios response body — shaping/normalising the data for
// UI use happens in src/hooks/useTimetable.js, not here.
//
// Rule: components must never call apiClient/axios directly — they
// go through the hooks in useTimetable.js, which call these functions.
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

// ═══════════════════════════════════════════════════════════════
// HOD
// ═══════════════════════════════════════════════════════════════

/**
 * fetchTimetables — list the timetables owned by the logged-in HOD's department.
 * Params: none
 * Returns: Promise<{ data: Array<Timetable> }>
 */
export async function fetchTimetables() {
  // apiClient.get(url) — sends a GET request through the shared axios
  // instance (which attaches the Bearer token automatically) and
  // resolves with the full axios response object.
  const res = await apiClient.get('/api/timetables')
  return res.data
}

/**
 * createTimetable — start a new draft timetable for a batch + semester.
 * Params: payload: { sessionId: number, batchYear: number, semesterNumber: number }
 * Returns: Promise<{ data: Timetable }>
 */
export async function createTimetable(payload) {
  // apiClient.post(url, body) — sends a POST request with a JSON body.
  const res = await apiClient.post('/api/timetables', payload)
  return res.data
}

/**
 * addSlot — add one weekly class slot to a draft/returned timetable.
 * Params:
 *   timetableId: number
 *   payload: { subjectId, facultyId, dayOfWeek(1-6), startTime, endTime, classroom, slotType }
 * Returns: Promise<{ data: Slot }>
 */
export async function addSlot(timetableId, payload) {
  const res = await apiClient.post(`/api/timetables/${timetableId}/slots`, payload)
  return res.data
}

/**
 * removeSlot — delete a single slot from a draft/returned timetable.
 * Params: slotId: number
 * Returns: Promise<{ data: null }>
 */
export async function removeSlot(slotId) {
  // apiClient.delete(url) — sends a DELETE request, no body.
  const res = await apiClient.delete(`/api/timetable-slots/${slotId}`)
  return res.data
}

/**
 * submitTimetable — move a draft/returned timetable to "submitted" so
 * admin can review it.
 * Params: id: number
 * Returns: Promise<{ data: Timetable }>
 */
export async function submitTimetable(id) {
  // apiClient.patch(url, body?) — sends a PATCH request for a partial update.
  const res = await apiClient.patch(`/api/timetables/${id}/submit`)
  return res.data
}

// ═══════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════

/**
 * fetchAdminTimetables — list timetables submitted by all HODs, for review.
 * Params: none
 * Returns: Promise<{ data: Array<Timetable> }>
 */
export async function fetchAdminTimetables() {
  const res = await apiClient.get('/api/admin/timetables')
  return res.data
}

/**
 * approveTimetable — mark a submitted timetable as approved and active.
 * Params: id: number
 * Returns: Promise<{ data: Timetable }>
 */
export async function approveTimetable(id) {
  const res = await apiClient.patch(`/api/admin/timetables/${id}/approve`)
  return res.data
}

/**
 * returnTimetable — send a submitted timetable back to the HOD with feedback.
 * Params: id: number, comment: string (required — explains what to fix)
 * Returns: Promise<{ data: Timetable }>
 */
export async function returnTimetable(id, comment) {
  const res = await apiClient.patch(`/api/admin/timetables/${id}/return`, { comment })
  return res.data
}

// ═══════════════════════════════════════════════════════════════
// FACULTY
// ═══════════════════════════════════════════════════════════════

/**
 * fetchFacultyTimetable — the logged-in faculty member's full weekly schedule.
 * Params: none
 * Returns: Promise<{ data: Array<Slot> }>
 */
export async function fetchFacultyTimetable() {
  const res = await apiClient.get('/api/faculty/timetable')
  return res.data
}

/**
 * fetchFacultyTimetableToday — the logged-in faculty member's classes for today only.
 * Params: none
 * Returns: Promise<{ data: Array<Slot> }>
 */
export async function fetchFacultyTimetableToday() {
  const res = await apiClient.get('/api/faculty/timetable/today')
  return res.data
}

// ═══════════════════════════════════════════════════════════════
// STUDENT
// ═══════════════════════════════════════════════════════════════

/**
 * fetchStudentTimetable — the logged-in student's full weekly timetable.
 * Params: none
 * Returns: Promise<{ data: Array<Slot> }>
 */
export async function fetchStudentTimetable() {
  const res = await apiClient.get('/api/students/timetable')
  return res.data
}

/**
 * fetchStudentTimetableToday — the logged-in student's classes for today only.
 * Params: none
 * Returns: Promise<{ data: Array<Slot> }>
 */
export async function fetchStudentTimetableToday() {
  const res = await apiClient.get('/api/students/timetable/today')
  return res.data
}
