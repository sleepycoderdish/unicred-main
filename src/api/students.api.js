// src/api/students.api.js
// ─────────────────────────────────────────────────────────────
// Student listing (Phase 1 student resource).
//
// Used by the HOD's "Register Students" screen so the HOD can pick students
// from a list (roll number + name) instead of typing raw database IDs.
//
// REAL ENDPOINT (confirmed):
//   GET /api/students/:departmentId
//     - :departmentId is the DEPARTMENT id (e.g. 30001), NOT a student id.
//     - Callable by hod / admin / faculty.
//     - Returns the students of that department.
//     - Optional query params can be used for extra sorting/filtering
//       (e.g. batchYear, semesterNumber). We pass them through, and ALSO
//       filter again on the client so the result is correct even if the
//       backend ignores a particular query param.
//
//   Each student is expected to look like:
//     { id, rollNo, batchYear, currentSemester, branch,
//       user: { id, name, email } }
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

/**
 * fetchStudents — list students for ONE department.
 *
 * The school is taken from the token automatically (never sent).
 *
 * @param {number} departmentId - department whose students to list (path param)
 * @param {{ batchYear?: number, semesterNumber?: number }} [filters] - optional query params
 * @returns {Promise<object>} the raw API response (envelope or array)
 */
export async function fetchStudents(departmentId, filters = {}) {
  // Build query params, dropping empty values so we never send "?batchYear=".
  const params = {}
  if (filters.batchYear)      params.batchYear      = filters.batchYear
  if (filters.semesterNumber) params.semesterNumber = filters.semesterNumber

  // departmentId goes in the PATH, not the query string.
  const res = await apiClient.get(`/api/students/${departmentId}`, { params })
  return res.data
}