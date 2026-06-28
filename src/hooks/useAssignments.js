// src/hooks/useAssignments.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/assignments.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  myAssignments:      () => ['my-assignments'],
  assessmentSubjects: () => ['assessment-subjects'],
  assessments:        (subjectId, sessionId) => ['assessments', subjectId, sessionId],
  sessionStudents:    (sessionId) => ['session-students', sessionId],
}

export function useMyAssignments() {
  return useQuery({
    queryKey: KEYS.myAssignments(),
    queryFn: async () => {
      const res = await api.fetchMyAssignments()
      return res.data ?? []
    },
  })
}

export function useAssessmentSubjects() {
  return useQuery({
    queryKey: KEYS.assessmentSubjects(),
    queryFn: async () => {
      const res = await api.fetchAssessmentSubjects()
      return res.data ?? []
    },
  })
}

export function useAssessments(subjectId, sessionId) {
  return useQuery({
    queryKey: KEYS.assessments(subjectId, sessionId),
    queryFn: async () => {
      const res = await api.fetchAssessments(subjectId, sessionId)
      return res.data ?? []
    },
    enabled: !!subjectId && !!sessionId,
  })
}

export function useSessionStudents(sessionId) {
  return useQuery({
    queryKey: KEYS.sessionStudents(sessionId),
    queryFn: async () => {
      const res = await api.fetchSessionStudents(sessionId)
      return res.data ?? []
    },
    enabled: !!sessionId,
  })
}

export function useCreateAssessment() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createAssessment,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.assessments(vars.subjectId, vars.sessionId) })
      toastSuccess('Assessment marks saved.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}