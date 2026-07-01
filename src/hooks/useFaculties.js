// src/hooks/useFaculties.js
// ─────────────────────────────────────────────────────────────
// React Query hooks for faculty data.
// Used in: FacultiesPage, AssignHodModal (to pick a faculty for HOD).
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/faculties.api'
import useAuthStore from '@/store/auth.store'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// ── Query key factory ─────────────────────────────────────────
export const FACULTY_KEYS = {
  // A null departmentId must never share a cache key with a real one — a
  // caller whose department is still resolving would otherwise be served
  // the cached unfiltered whole-school list.
  list: (departmentId) =>
    departmentId == null
      ? ['faculties', 'all']
      : ['faculties', 'department', Number(departmentId)],
  byId: (userId) => ['faculty', userId],
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

      // pickArray: tolerate any response shape (envelope, raw array, etc.).
      let list = []
      if (Array.isArray(res)) list = res
      else if (Array.isArray(res?.data)) list = res.data
      else if (Array.isArray(res?.data?.data)) list = res.data.data
      else {
        const firstArray = (o) => (o && typeof o === 'object' ? Object.values(o).find(Array.isArray) : undefined)
        list = firstArray(res) || firstArray(res?.data) || []
      }

      // CLIENT-SIDE department filter. Even if the backend ignores the
      // ?departmentId query param and returns the whole school, we only keep
      // faculty whose departmentId matches — so an HOD never sees faculty from
      // another department in the assignment dropdown.
      if (departmentId != null) {
        const wantedDeptId = Number(departmentId)
        list = list.filter(f => Number(f.departmentId) === wantedDeptId)
      }
      return list
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

// ── useMyFaculty ──────────────────────────────────────────────
/**
 * useMyFaculty — returns the CURRENTLY logged-in user's own faculty record.
 *
 * Why it reads from the LIST instead of GET /api/faculties/:id:
 *   The by-id endpoint resolves by Faculty.id, but all we have from the token
 *   is the userId — passing the userId there returns 404. The faculty LIST,
 *   however, is readable by hod/faculty and every row carries `userId`, so we
 *   just find our own row in the list. This is reliable and avoids 404s.
 *
 * An HOD is also stored as a faculty, so this works for HODs too.
 *
 * @returns {{ data: object|null, isLoading: boolean, isError: boolean }}
 */
export function useMyFaculty() {
  const userId = useAuthStore((s) => s.user?.userId)
  // Full (unfiltered) school faculty list — readable by hod/faculty.
  const { data: faculties = [], isLoading, isError } = useFaculties()
  // Find our own row by userId.
  const mine = faculties.find((f) => Number(f.userId) === Number(userId)) ?? null
  return { data: mine, isLoading, isError }
}

// ── useMyDepartmentId ─────────────────────────────────────────
/**
 * useMyDepartmentId — convenience wrapper that returns just the logged-in
 * user's departmentId (or null while it's still loading).
 * @returns {number|null}
 */
export function useMyDepartmentId() {
  const { data } = useMyFaculty()
  return data?.departmentId ?? data?.department?.id ?? null
}

// ── usePushFacultyProfile ─────────────────────────────────────
/**
 * usePushFacultyProfile — invited faculty/HOD completes their own profile.
 * On success it refreshes the user's own faculty record (so the new
 * department/designation show up immediately).
 *
 * Usage:
 *   const { mutate: saveProfile, isPending } = usePushFacultyProfile()
 *   saveProfile({ departmentId, designation }, { onSuccess })
 */
export function usePushFacultyProfile() {
  const qc = useQueryClient()
  const userId = useAuthStore((s) => s.user?.userId)
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    mutationFn: api.pushFacultyProfile,
    onSuccess: () => {
      // Refresh "my faculty" so the page reflects the saved department/designation.
      qc.invalidateQueries({ queryKey: FACULTY_KEYS.byId(userId) })
      toastSuccess('Profile saved successfully.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}