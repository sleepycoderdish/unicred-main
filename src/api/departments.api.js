// src/api/departments.api.js
// ─────────────────────────────────────────────────────────────
// All department-related API calls (Admin only).
// Every call goes through apiClient so the Bearer token
// is attached automatically by the request interceptor.
// ─────────────────────────────────────────────────────────────

import apiClient from '@/api/client'

// ── Endpoint paths ────────────────────────────────────────────
const BASE = '/api/departments'
const byId = (id) => `/api/departments/${id}`

// ── Fetch all departments ─────────────────────────────────────
/**
 * fetchDepartments — returns every department in the admin's school.
 *
 * REQUEST  : GET /api/departments
 *   Header : Authorization: Bearer <accessToken>
 *
 * RESPONSE : 200
 *   {
 *     success: true,
 *     message: "Departments fetched successfully",
 *     data: [
 *       { id, schoolId, name, hodUserId, createdAt, updatedAt, deletedAt }
 *     ]
 *   }
 *
 * @returns {Promise<Array>} array of department objects
 */
export async function fetchDepartments() {
  const res = await apiClient.get(BASE)
  return res.data // full { success, message, data }
}

// ── Fetch department by ID ─────────────────────────────────────
/**
 * fetchDepartmentById — fetches one department including nested hod user.
 *
 * REQUEST  : GET /api/departments/:id
 *   Header : Authorization: Bearer <accessToken>
 *   Param  : id — departmentId (number)
 *
 * RESPONSE : 200
 *   {
 *     success: true,
 *     data: { ...department, hod: { ...userFields } | null }
 *   }
 *
 * @param {number} id - departmentId
 * @returns {Promise<Object>} single department with nested hod
 */
export async function fetchDepartmentById(id) {
  const res = await apiClient.get(byId(id))
  return res.data
}

// ── Create department ─────────────────────────────────────────
/**
 * createDepartment — creates a new department inside the admin's school.
 * schoolId is derived from the access token on the backend.
 *
 * REQUEST  : POST /api/departments
 *   Header : Authorization: Bearer <accessToken>
 *   Body   : { name: string }
 *
 * RESPONSE : 201
 *   { success: true, message: "Department created", data: { ...department } }
 *
 * @param {string} name - department name (e.g. "Electrical Engineering")
 * @returns {Promise<Object>}
 */
export async function createDepartment(name) {
  const res = await apiClient.post(BASE, { name: name.trim() })
  return res.data
}

// ── Update department (rename / assign HOD) ───────────────────
/**
 * updateDepartment — updates department name and/or assigns a HOD.
 *
 * Used for both:
 *   (a) Renaming a department  — pass { name: "New Name" }
 *   (b) Assigning a HOD        — pass { hodUserId: <userId of faculty> }
 *   (c) Both at once           — pass { name, hodUserId }
 *
 * REQUEST  : PUT /api/departments/:id
 *   Header : Authorization: Bearer <accessToken>
 *   Param  : id — departmentId
 *   Body   : { hodUserId?: number, name?: string }
 *
 * RESPONSE : 200
 *   {
 *     success: true,
 *     message: "Department updated successfully",
 *     data: {
 *       id, schoolId, name, hodUserId, createdAt, updatedAt, deletedAt,
 *       hod: { id, name, email, role, ... }
 *     }
 *   }
 *
 * @param {number} id      - departmentId
 * @param {Object} payload - { hodUserId?: number, name?: string }
 * @returns {Promise<Object>}
 */
export async function updateDepartment(id, payload) {
  const res = await apiClient.put(byId(id), payload)
  return res.data
}