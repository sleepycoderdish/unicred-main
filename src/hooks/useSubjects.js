// src/hooks/useSubjects.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/subjects.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  all:      () => ['subjects'],
  offerings: (sessionId) => ['offerings', sessionId],
}

export function useSubjects() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchSubjects()
      return res.data ?? []
    },
  })
}

export function useOfferings(sessionId) {
  return useQuery({
    queryKey: KEYS.offerings(sessionId),
    queryFn: async () => {
      const res = await api.fetchOfferings(sessionId)
      return res.data ?? []
    },
    enabled: !!sessionId,
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
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: KEYS.offerings(vars.sessionId) }); toastSuccess('Course offering added.') },
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