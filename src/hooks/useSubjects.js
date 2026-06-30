// src/hooks/useSubjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/subjects.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// pickArray — always return an array no matter how the backend wrapped it.
// (Same helper used for sessions; defined locally so there's no extra import.)
// Handles: [...] | { data: [...] } | { data: { data: [...] } } |
//          { courses: [...] } / { offerings: [...] } (first array property).
function pickArray(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  const firstArray = (obj) =>
    obj && typeof obj === 'object' ? Object.values(obj).find(Array.isArray) : undefined
  return firstArray(res) || firstArray(res?.data) || []
}

const KEYS = {
  all:      () => ['subjects'],
  offerings: (sessionId) => ['offerings', sessionId],
}

export function useSubjects() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchSubjects()
      // pickArray means a freshly-created subject can't read as "empty".
      return pickArray(res)
    },
  })
}

export function useOfferings(sessionId) {
  // Normalise to a number so the cache key matches everywhere (the select
  // gives us a string) and the backend gets an integer.
  const sid = sessionId ? Number(sessionId) : null
  return useQuery({
    queryKey: KEYS.offerings(sid),
    queryFn: async () => {
      const res = await api.fetchOfferings(sid)
      return pickArray(res)
    },
    enabled: !!sid,
  })
}

export function useCreateSubject() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Subject created.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useUpdateSubject() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateSubject(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Subject updated.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useDeactivateSubject() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.deactivateSubject,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Subject deactivated.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useCreateOffering() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createOffering,
    onSuccess: () => {
      // Prefix-invalidate ALL offering lists (avoids a Number/String key
      // mismatch that previously left the list showing "no offerings").
      qc.invalidateQueries({ queryKey: ['offerings'] })
      toastSuccess('Course offering added.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useDeleteOffering() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.deleteOffering,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['offerings'] }); toastSuccess('Offering removed.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

/**
 * useSubjectDetail — fetch a single subject by id.
 *
 * Uses the /view endpoint so it works for students (the plain
 * GET /courses/:id is restricted to admin/hod).
 *
 * @param {number|string|null} subjectId
 */
export function useSubjectDetail(subjectId) {
  return useQuery({
    queryKey: ['subject-detail', subjectId],
    queryFn: async () => {
      const res = await api.fetchSubjectForAnyRole(subjectId)
      // res is the backend JSON envelope: { success: true, data: {...subject} }
      return res?.data ?? null
    },
    enabled: !!subjectId,
  })
}