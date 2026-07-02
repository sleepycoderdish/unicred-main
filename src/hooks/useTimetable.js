// src/hooks/useTimetable.js
// ─────────────────────────────────────────────────────────────
// React-query hooks for the timetable feature (HOD, Admin, Faculty, Student).
// Components must use these hooks instead of calling src/api/timetable.api.js
// directly — this is the only place that touches useQuery/useMutation for
// timetables, so cache keys and error/toast handling stay in one place.
// ─────────────────────────────────────────────────────────────

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/timetable.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// pickArray — always return an array no matter how the backend wrapped it.
// (Same helper used in useSessions.js/useSubjects.js; kept local so this
// file has no extra dependency that could go missing.)
// Handles: [...] | { data: [...] } | { data: { data: [...] } } |
//          { slots: [...] } / etc. (first array-valued property it finds).
function pickArray(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  const firstArray = (obj) =>
    obj && typeof obj === 'object' ? Object.values(obj).find(Array.isArray) : undefined
  return firstArray(res) || firstArray(res?.data) || []
}

const KEYS = {
  hodTimetables:      () => ['timetables'],
  adminTimetables:    () => ['admin-timetables'],
  facultyTimetable:   () => ['faculty-timetable'],
  facultyToday:       () => ['faculty-timetable-today'],
  studentTimetable:   () => ['student-timetable'],
  studentToday:       () => ['student-timetable-today'],
}

// ═══════════════════════════════════════════════════════════════
// HOD
// ═══════════════════════════════════════════════════════════════

/**
 * useTimetables — fetch the HOD's own timetables (draft/submitted/returned/approved).
 * Params: none
 * Returns: react-query result — { data: Array<Timetable>, isLoading, ... }
 */
export function useTimetables() {
  return useQuery({
    queryKey: KEYS.hodTimetables(),
    queryFn: async () => {
      const res = await api.fetchTimetables()
      return pickArray(res)
    },
  })
}

/**
 * useCreateTimetable — start a new draft timetable.
 * Params: none (call mutate({ sessionId, batchYear, semesterNumber }))
 * Returns: react-query mutation result
 */
export function useCreateTimetable() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createTimetable,
    onSuccess: () => {
      // invalidateQueries — marks the 'timetables' cache stale so the list refetches.
      qc.invalidateQueries({ queryKey: KEYS.hodTimetables() })
      toastSuccess('Timetable created.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

/**
 * useAddSlot — add a slot to a draft/returned timetable.
 * Params: none (call mutate({ timetableId, subjectId, facultyId, dayOfWeek, startTime, endTime, classroom, slotType }))
 * Returns: react-query mutation result
 */
export function useAddSlot() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ timetableId, ...payload }) => api.addSlot(timetableId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.hodTimetables() })
      toastSuccess('Slot added.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

/**
 * useRemoveSlot — delete a slot from a draft/returned timetable.
 * Params: none (call mutate(slotId))
 * Returns: react-query mutation result
 */
export function useRemoveSlot() {
  const qc = useQueryClient()
  const { toastError } = useUiStore()
  return useMutation({
    mutationFn: api.removeSlot,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.hodTimetables() }),
    onError: (err) => toastError(parseApiError(err).message),
  })
}

/**
 * useSubmitTimetable — submit a draft/returned timetable to admin for approval.
 * Params: none (call mutate(timetableId))
 * Returns: react-query mutation result
 */
export function useSubmitTimetable() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.submitTimetable,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.hodTimetables() })
      toastSuccess('Timetable submitted to admin.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

// ═══════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════

/**
 * useAdminTimetables — fetch every timetable submitted by HODs, for review.
 * Params: none
 * Returns: react-query result — { data: Array<Timetable>, isLoading, ... }
 */
export function useAdminTimetables() {
  return useQuery({
    queryKey: KEYS.adminTimetables(),
    queryFn: async () => {
      const res = await api.fetchAdminTimetables()
      return pickArray(res)
    },
  })
}

/**
 * useApproveTimetable — approve a submitted timetable.
 * Params: none (call mutate(timetableId))
 * Returns: react-query mutation result
 */
export function useApproveTimetable() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.approveTimetable,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.adminTimetables() })
      toastSuccess('Timetable approved.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

/**
 * useReturnTimetable — send a submitted timetable back to the HOD with a comment.
 * Params: none (call mutate({ id, comment }))
 * Returns: react-query mutation result
 */
export function useReturnTimetable() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, comment }) => api.returnTimetable(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.adminTimetables() })
      toastSuccess('Timetable returned to HOD.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

// ═══════════════════════════════════════════════════════════════
// FACULTY
// ═══════════════════════════════════════════════════════════════

/**
 * useFacultyTimetable — the logged-in faculty member's full weekly schedule.
 * Params: none
 * Returns: react-query result — { data: Array<Slot>, isLoading, ... }
 */
export function useFacultyTimetable() {
  return useQuery({
    queryKey: KEYS.facultyTimetable(),
    queryFn: async () => {
      const res = await api.fetchFacultyTimetable()
      return pickArray(res)
    },
  })
}

/**
 * useFacultyTimetableToday — the logged-in faculty member's classes for today.
 * Params: none
 * Returns: react-query result — { data: Array<Slot>, isLoading, ... }
 */
export function useFacultyTimetableToday() {
  return useQuery({
    queryKey: KEYS.facultyToday(),
    queryFn: async () => {
      const res = await api.fetchFacultyTimetableToday()
      return pickArray(res)
    },
  })
}

// ═══════════════════════════════════════════════════════════════
// STUDENT
// ═══════════════════════════════════════════════════════════════

/**
 * useStudentTimetable — the logged-in student's full weekly timetable.
 * Params: none
 * Returns: react-query result — { data: Array<Slot>, isLoading, ... }
 */
export function useStudentTimetable() {
  return useQuery({
    queryKey: KEYS.studentTimetable(),
    queryFn: async () => {
      const res = await api.fetchStudentTimetable()
      return pickArray(res)
    },
  })
}

/**
 * useStudentTimetableToday — the logged-in student's classes for today.
 * Params: none
 * Returns: react-query result — { data: Array<Slot>, isLoading, ... }
 */
export function useStudentTimetableToday() {
  return useQuery({
    queryKey: KEYS.studentToday(),
    queryFn: async () => {
      const res = await api.fetchStudentTimetableToday()
      return pickArray(res)
    },
  })
}
