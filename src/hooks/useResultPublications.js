// src/hooks/useResultPublications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/results.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// Query key factory. NOTE: React Query treats a shorter key as a "prefix"
// match for any longer key that starts the same way — e.g. invalidating
// ['result-publications', 5] also invalidates ['result-publications', 5,
// 'summary']. That's why byId/summary/pending/failures all start with the
// same ['result-publications', id, ...] shape below.
const KEYS = {
  list:     ()   => ['result-publications'],
  byId:     (id) => ['result-publications', id],
  summary:  (id) => ['result-publications', id, 'summary'],
  pending:  (id, departmentId) => ['result-publications', id, 'pending', departmentId ?? null],
  failures: (id) => ['result-publications', id, 'failures'],
  mySubjects: () => ['result-my-subjects'],
  submissions: (subjectId, publicationId) => ['submissions', subjectId, publicationId],
  roster:      (subjectId, publicationId) => ['roster', subjectId, publicationId],
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

// expectedDepartmentId: the publication's own department. Defensive filter —
// strips any faculty row whose department doesn't match, even if a bad
// cross-department assignment slipped past the assignment-creation flow.
export function usePendingSubmissions(id, expectedDepartmentId = null) {
  return useQuery({
    queryKey: KEYS.pending(id, expectedDepartmentId),
    queryFn: async () => {
      const res = await api.fetchPendingSubmissions(id)
      const list = res.data ?? []
      if (expectedDepartmentId == null) return list
      return list.filter(row => Number(row.faculty?.departmentId) === Number(expectedDepartmentId))
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

// useUpdatePublicationStatus — powers every lifecycle button on the
// Publications page: "Send for Review", "Freeze", "Publish", "Unfreeze".
//
// WHY THIS HOOK EXISTED AS A BUG:
// React Query keeps its own cached copy of server data. When the PATCH
// request below succeeds, the backend's database is updated immediately —
// but React Query does NOT know that on its own. Unless we explicitly tell
// it "this cached data is now stale, go fetch it again", it keeps showing
// the OLD cached status (e.g. "frozen") and the OLD action buttons
// ("Publish"/"Unfreeze") forever, until the user hits a manual page refresh
// (which throws away the whole cache and starts fresh).
//
// THE FIX: in onSuccess, call queryClient.invalidateQueries() for every
// cached query that could be showing this publication's status. React Query
// then automatically refetches any of those queries that are currently being
// displayed on screen, and the component re-renders with the fresh status —
// no manual refresh needed.
export function useUpdatePublicationStatus() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, status }) => api.updatePublicationStatus(id, status),
    // The second argument here is the object passed to mutate({ id, status }).
    // We need BOTH values: `id` to target this exact publication's cached
    // queries, and `status` to pick the right toast message below.
    onSuccess: (_, { id, status }) => {
      // 1) The PUBLICATIONS LIST — this is what PublicationsPage.jsx reads via
      //    usePublications() to decide which action buttons to show for each
      //    row. Invalidating this makes the row's buttons update instantly.
      qc.invalidateQueries({ queryKey: KEYS.list() })

      // 2) THIS ONE PUBLICATION — invalidating ['result-publications', id]
      //    also refreshes everything nested under it: usePublicationById,
      //    usePublicationSummary, usePendingSubmissions, and
      //    useFailedStudents all use keys that START WITH this same prefix
      //    (see the KEYS object above), so React Query treats them as a
      //    match too. This keeps the PublicationReview detail page (badge,
      //    Summary/Pending/Failures tabs) in sync as well.
      qc.invalidateQueries({ queryKey: KEYS.byId(id) })

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

export function useRoster(subjectId, publicationId) {
  return useQuery({
    queryKey: KEYS.roster(subjectId, publicationId),
    queryFn: async () => {
      const res = await api.fetchRoster(subjectId, publicationId)
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