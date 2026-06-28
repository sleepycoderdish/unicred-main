// src/hooks/useResultPublications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/results.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  list:     ()   => ['result-publications'],
  byId:     (id) => ['result-publications', id],
  summary:  (id) => ['result-publications', id, 'summary'],
  pending:  (id) => ['result-publications', id, 'pending'],
  failures: (id) => ['result-publications', id, 'failures'],
  mySubjects: () => ['result-my-subjects'],
  submissions: (subjectId, publicationId) => ['submissions', subjectId, publicationId],
}

export function usePublications() {
  return useQuery({
    queryKey: KEYS.list(),
    queryFn: async () => {
      const res = await api.fetchPublications()
      return res.data ?? []
    },
  })
}

export function usePublicationById(id) {
  return useQuery({
    queryKey: KEYS.byId(id),
    queryFn: async () => {
      const res = await api.fetchPublicationById(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function usePublicationSummary(id) {
  return useQuery({
    queryKey: KEYS.summary(id),
    queryFn: async () => {
      const res = await api.fetchPublicationSummary(id)
      return res.data
    },
    enabled: !!id,
  })
}

export function usePendingSubmissions(id) {
  return useQuery({
    queryKey: KEYS.pending(id),
    queryFn: async () => {
      const res = await api.fetchPendingSubmissions(id)
      return res.data ?? []
    },
    enabled: !!id,
  })
}

export function useFailedStudents(id) {
  return useQuery({
    queryKey: KEYS.failures(id),
    queryFn: async () => {
      const res = await api.fetchFailedStudents(id)
      return res.data ?? []
    },
    enabled: !!id,
  })
}

export function useCreatePublication() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createPublication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      toastSuccess('Result publication created.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useUpdatePublicationStatus() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, status }) => api.updatePublicationStatus(id, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: KEYS.list() })
      const labels = {
        under_review: 'Sent for review.',
        frozen:       'Results frozen.',
        published:    'Results published. CGPA computation started.',
      }
      toastSuccess(labels[status] ?? 'Status updated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

// ── Faculty mark upload hooks ─────────────────────────────────

export function useMySubjects() {
  return useQuery({
    queryKey: KEYS.mySubjects(),
    queryFn: async () => {
      const res = await api.fetchMySubjects()
      return res.data ?? []
    },
  })
}

export function useSubmissions(subjectId, publicationId) {
  return useQuery({
    queryKey: KEYS.submissions(subjectId, publicationId),
    queryFn: async () => {
      const res = await api.fetchSubmissions(subjectId, publicationId)
      return res.data ?? []
    },
    enabled: !!subjectId && !!publicationId,
  })
}

export function useSubmitMarks() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.submitMarks,
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: KEYS.mySubjects() })
      qc.invalidateQueries({ queryKey: KEYS.list() })
      const { allSubmitted } = res.data ?? {}
      toastSuccess(allSubmitted ? 'All marks submitted! HOD has been notified.' : 'Marks submitted.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useEditSubmissions() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ subjectId, ...payload }) => api.editSubmissions(subjectId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mySubjects() })
      toastSuccess('Marks updated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useSubmitReappearMarks() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.submitReappearMarks,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.mySubjects() })
      toastSuccess('Reappear marks submitted. CGPA recomputed.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}