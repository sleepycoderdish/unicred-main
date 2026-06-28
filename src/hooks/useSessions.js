// src/hooks/useSessions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/sessions.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  all:  () => ['sessions'],
  byId: (id) => ['sessions', id],
}

export function useSessions() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchSessions()
      return res.data ?? []
    },
  })
}

export function useSessionById(id) {
  return useQuery({
    queryKey: KEYS.byId(id),
    queryFn: async () => {
      const res = await api.fetchSessionById(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function useCreateSession() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createSession,
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Session created.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useUpdateSession() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateSession(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: KEYS.all() }); toastSuccess('Session updated.') },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useUpdateSessionStatus() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, status }) => api.updateSessionStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      const labels = { active: 'Session activated.', completed: 'Session marked complete.', archived: 'Session archived.' }
      toastSuccess(labels[status] ?? 'Status updated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}