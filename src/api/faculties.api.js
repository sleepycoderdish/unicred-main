// src/api/faculties.api.js
// ─────────────────────────────────────────────────────────────
// Faculty-related API calls (Admin only).
// Note the endpoint inconsistency in the spec:
//   List  → /api/faculties  (plural)
//   ById  → /api/faculty/:id (singular, takes userId not facultyId)
// Both are implemented exactly as the backend defines them.
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

// ── Fetch all faculties ───────────────────────────────────────
/**
 * fetchFaculties — returns all faculty members in the admin's school.
 * Optionally filtered by departmentId via query param.
 *
 * REQUEST  : GET /api/faculties
 *   Header : Authorization: Bearer <accessToken>
 *   Query  : departmentId? (number) — filters results to one department
 *
 * RESPONSE : 200
 *   {
 *     success: true,
 *     message: "Faculty fetched successfully",
 *     data: [
 *       {
 *         id, userId, schoolId, departmentId, designation, officeLocation,
 *         createdAt, updatedAt, deletedAt,
 *         user: { id, schoolId, email, role, name, ... },
 *         department: { id, schoolId, name, hodUserId, ... }
 *       }
 *     ]
 *   }
 *
 * @param {number|null} [departmentId] - optional filter
 * @returns {Promise<Object>} full response { success, message, data }
 */
export async function fetchFaculties(departmentId = null) {
  // Only send the query param if a departmentId is actually provided
  const params = departmentId ? { departmentId } : {}
  const res = await apiClient.get('/api/faculties', { params })
  return res.data
}

// ── Fetch faculty by userId ───────────────────────────────────
/**
 * fetchFacultyById — fetches a single faculty member by their userId.
 * Note: the param is userId (from the User table), NOT the Faculty.id.
 *
 * REQUEST  : GET /api/faculty/:id   (where :id = userId)
 *   Header : Authorization: Bearer <accessToken>
 *   Param  : id — userId of the faculty member
 *
 * RESPONSE : 200
 *   {
 *     success: true,
 *     message: "Faculty fetched successfully",
 *     data: {
 *       id, userId, schoolId, departmentId, designation, officeLocation,
 *       user: { ...full user object },
 *       department: { ...full department object }
 *     }
 *   }
 *
 * @param {number} userId - the User.id of the faculty member
 * @returns {Promise<Object>}
 */
export async function fetchFacultyById(userId) {
  const res = await apiClient.get(`/api/faculty/${userId}`)
  return res.data
}