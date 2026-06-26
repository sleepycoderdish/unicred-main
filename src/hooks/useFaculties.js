// src/hooks/useFaculties.js
// ─────────────────────────────────────────────────────────────
// React Query hooks for faculty data.
// Used in: FacultiesPage, AssignHodModal (to pick a faculty for HOD).
// ─────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/faculties.api'

// ── Query key factory ─────────────────────────────────────────
export const FACULTY_KEYS = {
  // Include departmentId in the key so filtered and unfiltered results
  // cache separately (avoid showing stale filtered data after clearing filter)
  list:  (departmentId) => ['faculties', { departmentId: departmentId ?? null }],
  byId:  (userId)       => ['faculty', userId],
}

// ── useFaculties ──────────────────────────────────────────────
/**
 * useFaculties — fetches faculty list, optionally filtered by department.
 *
 * @param {number|null} [departmentId] - pass null/undefined for all faculties
 * @returns TanStack Query result
 *   data shape: Array<{
 *     id, userId, schoolId, departmentId, designation, officeLocation,
 *     user: { id, name, email, role, profilePhotoUrl, ... },
 *     department: { id, name, hodUserId, ... }
 *   }>
 */
export function useFaculties(departmentId = null) {
  return useQuery({
    queryKey: FACULTY_KEYS.list(departmentId),
    queryFn: async () => {
      const res = await api.fetchFaculties(departmentId)
      return res.data ?? []
    },
  })
}

// ── useFacultyById ────────────────────────────────────────────
/**
 * useFacultyById — fetches a single faculty member by their userId.
 * Note: parameter is userId (User.id), not Faculty.id.
 *
 * @param {number|null} userId - User.id of the faculty member
 */
export function useFacultyById(userId) {
  return useQuery({
    queryKey: FACULTY_KEYS.byId(userId),
    queryFn: async () => {
      const res = await api.fetchFacultyById(userId)
      return res.data
    },
    enabled: !!userId,
  })
}