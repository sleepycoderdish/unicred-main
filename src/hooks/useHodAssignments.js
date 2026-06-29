// src/hooks/useHodAssignments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/hodAssignments.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = { all: () => ['hod-assignments'] }

export function useHodAssignments() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchHodAssignments()
      return res.data ?? []
    },
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