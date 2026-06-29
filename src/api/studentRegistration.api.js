// src/api/studentRegistration.api.js
// ─────────────────────────────────────────────────────────────
// Section 7: Student Session Registration
//
// HOD registers students into an academic session.
// Subjects are auto-determined from CourseOfferings by
// dept + batch + semester — HOD does not pick them manually.
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

/**
 * registerStudentsForSession — HOD bulk-registers students into a session.
 *
 * REQUEST  : POST /api/studentReg/register-session
 *   Header : Authorization: Bearer <accessToken>
 *   Body   : {
 *     sessionId:      number,
 *     studentIds:     number[],   // array of student IDs to register
 *     semesterNumber: number,     // 1–8
 *     batchYear:      number      // e.g. 2022
 *   }
 *
 * Constraints (backend enforced):
 *   - A student cannot be in two active sessions simultaneously
 *   - Detained students are registered but flagged in the response
 *   - Subjects are auto-assigned from CourseOfferings — no manual selection
 *
 * RESPONSE : 201
 *   { success: true, data: { registered: number, skipped: number } }
 *
 * @param {{ sessionId, studentIds, semesterNumber, batchYear }} payload
 */
export async function registerStudentsForSession(payload) {
  const res = await apiClient.post('/api/studentReg/register-session', payload)
  return res.data
}

/**
 * fetchStudentsInSession — HOD views all students registered in a session.
 *
 * REQUEST  : GET /api/studentReg/session/:sessionId
 *   Header : Authorization: Bearer <accessToken>
 *   Param  : sessionId — AcademicSession.id
 *
 * RESPONSE : 200
 *   { success: true, data: [
 *     {
 *       id, studentId, sessionId, semesterNumber, batchYear, status,
 *       student: {
 *         id, rollNo, currentSemester, batchYear,
 *         user: { id, name, email }
 *       }
 *     }
 *   ]}
 *
 * status values: 'active' | 'completed' | 'detained'
 *
 * @param {number} sessionId
 */
export async function fetchStudentsInSession(sessionId) {
  const res = await apiClient.get(`/api/studentReg/session/${sessionId}`)
  return res.data
}

/**
 * fetchMySession — student fetches their own current session registration.
 *
 * REQUEST  : GET /api/studentReg/my-session
 *   Header : Authorization: Bearer <accessToken>
 *
 * RESPONSE : 200
 *   { success: true, data: {
 *     id, studentId, sessionId, semesterNumber, batchYear, status,
 *     session: {
 *       id, name, academicYear, semesterType, startDate, endDate, status
 *     }
 *   }}
 *
 * Returns null data if the student is not registered in any active session.
 */
export async function fetchMySession() {
  const res = await apiClient.get('/api/studentReg/my-session')
  return res.data
}