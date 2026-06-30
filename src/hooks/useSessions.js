// src/hooks/useSessions.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/sessions.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// ─────────────────────────────────────────────────────────────
// pickArray — always return an array from whatever the backend sent.
//
// Different endpoints reply in slightly different shapes. If the UI assumes
// only one shape, a perfectly valid response (like a list of sessions) can be
// read as "empty" — which is exactly the "an active session exists but the
// list shows nothing" bug. This helper normalises every common shape:
//
//   [ ... ]                       → used as-is
//   { data: [ ... ] }             → inner array
//   { data: { data: [ ... ] } }   → deepest array
//   { sessions: [ ... ] } / etc.  → first array-valued property it finds
//
// It is defined locally (not imported) so this file has no extra dependency
// that could go missing.
// ─────────────────────────────────────────────────────────────
function pickArray(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  // Fallback: look for the first array value inside the object (or its .data).
  const firstArray = (obj) =>
    obj && typeof obj === 'object' ? Object.values(obj).find(Array.isArray) : undefined
  return firstArray(res) || firstArray(res?.data) || []
}

// pickOne — same idea, but for a single object response.
function pickOne(res) {
  if (res == null) return null
  if (res.data?.data !== undefined) return res.data.data
  if (res.data !== undefined) return res.data
  return res
}

const KEYS = {
  all:  () => ['sessions'],
  byId: (id) => ['sessions', id],
}

export function useSessions() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchSessions()
      // pickArray copes with any response shape, so a real session list can
      // never be mistaken for "empty".
      return pickArray(res)
    },
  })
}

export function useSessionById(id) {
  return useQuery({
    queryKey: KEYS.byId(id),
    queryFn: async () => {
      const res = await api.fetchSessionById(id)
      return pickOne(res)
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