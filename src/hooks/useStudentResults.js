// src/hooks/useStudentResults.js
import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/studentResults.api'

const KEYS = {
  all:       ()          => ['student-results'],
  bySession: (sessionId) => ['student-results', sessionId],
  cgpa:      ()          => ['student-cgpa'],
}

export function useStudentResults() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchAllResults()
      return res.data ?? []
    },
  })
}

export function useStudentResultsBySession(sessionId) {
  return useQuery({
    queryKey: KEYS.bySession(sessionId),
    queryFn: async () => {
      const res = await api.fetchResultsBySession(sessionId)
      return res.data ?? []
    },
    enabled: !!sessionId,
  })
}

export function useCgpaHistory() {
  return useQuery({
    queryKey: KEYS.cgpa(),
    queryFn: async () => {
      const res = await api.fetchCgpaHistory()
      return res.data ?? []
    },
  })
}