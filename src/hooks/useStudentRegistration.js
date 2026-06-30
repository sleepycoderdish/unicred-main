// src/hooks/useStudentRegistration.js
// React Query hooks for student session registration (Section 7).

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/studentRegistration.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  mySession:          () => ['my-session'],
  sessionStudents:    (sessionId) => ['session-students', sessionId],
}

/**
 * useMySession — student's own current session registration.
 * Used on the student dashboard and subjects page.
 */
export function useMySession() {
  return useQuery({
    queryKey: KEYS.mySession(),
    queryFn: async () => {
      const res = await api.fetchMySession()
      return res.data ?? null  // null if not registered in any active session
    },
  })
}

/**
 * useStudentsInSession — HOD views all students registered in a session.
 * @param {number|null} sessionId
 */
export function useStudentsInSession(sessionId) {
  return useQuery({
    queryKey: KEYS.sessionStudents(sessionId),
    queryFn: async () => {
      const res = await api.fetchStudentsInSession(sessionId)
      return res.data ?? []
    },
    enabled: !!sessionId,
  })
}

/**
 * useRegisterStudents — HOD bulk-registers students into a session.
 * On success: invalidates the session student list so it refetches.
 */
export function useRegisterStudents() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    mutationFn: api.registerStudentsForSession,
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: KEYS.sessionStudents(vars.sessionId) })
      const { registered = 0, skipped = 0 } = res.data?.summary ?? {}
      toastSuccess(
        skipped > 0
          ? `${registered} students registered. ${skipped} skipped (already in a session).`
          : `${registered} students registered successfully.`
      )
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}