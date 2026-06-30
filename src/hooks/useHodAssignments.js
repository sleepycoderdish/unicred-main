// src/hooks/useHodAssignments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/hodAssignments.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// pickArray — return an array from any response shape (envelope / raw / nested).
function pickArray(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  const firstArray = (o) => (o && typeof o === 'object' ? Object.values(o).find(Array.isArray) : undefined)
  return firstArray(res) || firstArray(res?.data) || []
}

const KEYS = { all: () => ['hod-assignments'] }

/**
 * useHodAssignments — assignments for ONE session.
 * The backend list endpoint requires a sessionId, so the query stays disabled
 * until a session is chosen.
 */
export function useHodAssignments(sessionId) {
  const sid = sessionId ? Number(sessionId) : null
  return useQuery({
    queryKey: ['hod-assignments', sid],
    queryFn: async () => {
      const res = await api.fetchHodAssignments(sid)
      return pickArray(res)
    },
    enabled: !!sid,
  })
}

export function useCreateHodAssignment() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createHodAssignment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Faculty assigned.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useDeleteHodAssignment() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.deleteHodAssignment,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Assignment removed.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function usePatchHodAssignment() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.patchHodAssignment(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Assignment updated.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}