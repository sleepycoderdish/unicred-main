// src/hooks/useDepartments.js
// ─────────────────────────────────────────────────────────────
// React Query hooks for department operations.
//
// Query key factory keeps cache keys consistent across the app.
// All mutations auto-invalidate relevant queries on success so
// UI updates without a manual refetch.
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/departments.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// ── Query key factory ─────────────────────────────────────────
// Centralised so changing a key structure only needs one edit here.
export const DEPT_KEYS = {
  all:  () => ['departments'],
  byId: (id) => ['departments', id],
}

// ── useDepartments ────────────────────────────────────────────
/**
 * useDepartments — fetches the full list of departments.
 * Data shape returned: Array<{ id, schoolId, name, hodUserId, createdAt, ... }>
 *
 * @returns TanStack Query result { data, isLoading, isError, error }
 */
export function useDepartments() {
  return useQuery({
    queryKey: DEPT_KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchDepartments()
      // Unwrap the data array from the response envelope
      return res.data ?? []
    },
  })
}

// ── useDepartmentById ─────────────────────────────────────────
/**
 * useDepartmentById — fetches a single department with nested hod.
 *
 * @param {number|null} id - departmentId; pass null to skip the query
 * @returns TanStack Query result { data: Department & { hod: User|null } }
 */
export function useDepartmentById(id) {
  return useQuery({
    queryKey: DEPT_KEYS.byId(id),
    queryFn: async () => {
      const res = await api.fetchDepartmentById(id)
      return res.data
    },
    enabled: !!id, // don't run until id is provided
  })
}

// ── useCreateDepartment ───────────────────────────────────────
/**
 * useCreateDepartment — mutation to create a new department.
 * On success: invalidates the departments list + shows success toast.
 * On error:   shows the backend error message as an error toast.
 *
 * Usage:
 *   const { mutate, isPending } = useCreateDepartment()
 *   mutate('Electrical Engineering')
 */
export function useCreateDepartment() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    // mutationFn receives the department name string
    mutationFn: (name) => api.createDepartment(name),

    onSuccess: () => {
      // Invalidate list so it refetches with the new department included
      queryClient.invalidateQueries({ queryKey: DEPT_KEYS.all() })
      toastSuccess('Department created successfully.')
    },

    onError: (err) => {
      const { message } = parseApiError(err)
      toastError(message)
    },
  })
}

// ── useUpdateDepartment ───────────────────────────────────────
/**
 * useUpdateDepartment — mutation for both "Rename" and "Assign HOD".
 * Caller decides which fields to send:
 *   Rename only:    mutate({ id, name: 'New Name' })
 *   Assign HOD:     mutate({ id, hodUserId: 360001 })
 *   Both:           mutate({ id, name: 'EE', hodUserId: 360001 })
 *
 * On success: invalidates list + detail + shows success toast.
 */
export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    // Destructure id out of variables and send the rest as the body payload
    mutationFn: ({ id, ...payload }) => api.updateDepartment(id, payload),

    onSuccess: (responseData, variables) => {
      queryClient.invalidateQueries({ queryKey: DEPT_KEYS.all() })
      queryClient.invalidateQueries({ queryKey: DEPT_KEYS.byId(variables.id) })
      toastSuccess('Department updated successfully.')
    },

    onError: (err) => {
      const { message } = parseApiError(err)
      toastError(message)
    },
  })
}