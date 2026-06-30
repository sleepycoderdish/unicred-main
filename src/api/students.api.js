// src/api/students.api.js
// ─────────────────────────────────────────────────────────────
// Student listing (Phase 1 student resource).
//
// Used by the HOD's "Register Students" screen so the HOD can pick students
// from a list (roll number + name) instead of typing raw database IDs.
//
// REAL ENDPOINT (confirmed):
//   GET /api/students/filter
//     - All filters are sent as QUERY PARAMS (nothing goes in the URL path).
//     - Callable by hod / admin / faculty.
//     - Supported query params:
//         departmentId   — the department to list students for (e.g. 30001)
//         batchYear      — (optional) filter by batch year
//         semesterNumber — (optional) filter by semester number
//     - Empty/falsy params are omitted from the request.
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
 * @param {number} departmentId - department whose students to list (query param)
 * @param {{ batchYear?: number, semesterNumber?: number }} [filters] - optional query params
 * @returns {Promise<object>} the raw API response (envelope or array)
 */
export async function fetchStudents(departmentId, filters = {}) {
  // Build query params, dropping empty values so we never send "?batchYear=".
  const params = {}
  if (departmentId)            params.departmentId   = departmentId
  if (filters.batchYear)      params.batchYear      = filters.batchYear
  if (filters.semesterNumber) params.semesterNumber = filters.semesterNumber

  // All params go in the query string — /filter is a fixed path with no :id segment.
  const res = await apiClient.get('/api/students/filter', { params })
  return res.data
}