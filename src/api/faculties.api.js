// src/api/faculties.api.js
// ─────────────────────────────────────────────────────────────
// Faculty-related API calls.
//   List  → /api/faculties        (plural)
//   ById  → /api/faculties/:id     (plural; :id is the userId, not Faculty.id)
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

// Alias — the achievements pages (AchievementsPage, AchievementDetail) import
// this under the name `getFaculties`. Same function, same envelope return
// ({ success, message, data }); kept as an alias so both names resolve.
export const getFaculties = fetchFaculties

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
  // Correct endpoint is PLURAL: GET /api/faculties/:id  (where :id = userId).
  // The singular /api/faculty/:id returns 404.
  const res = await apiClient.get(`/api/faculties/${userId}`)
  return res.data
}

// ── Push own faculty profile ──────────────────────────────────
/**
 * pushFacultyProfile — an invited faculty/HOD completes their own profile
 * AFTER their first login.
 *
 * The invitee was created with only email/name/role. They don't yet have a
 * department or designation, so this call sets them. The backend reads the
 * user from the token, so we never send a userId.
 *
 * REQUEST  : POST /api/faculties/profile
 *   Header : Authorization: Bearer <accessToken>  (attached automatically)
 *   Body   : { departmentId: number, designation: string }
 *
 * RESPONSE : 200/201
 *   { success: true, message: "Profile saved.", data: { ...faculty } }
 *
 * @param {{ departmentId: number, designation: string }} data
 * @returns {Promise<object>} the response body (envelope)
 */
export async function pushFacultyProfile(data) {
  const res = await apiClient.post('/api/faculties/profile', {
    departmentId: Number(data.departmentId),
    designation:  data.designation,
  })
  return res.data
}