// src/hooks/useReappear.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/reappear.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  myApplications:   ()       => ['reappear-my-applications'],
  department:       (status) => ['reappear-department', status ?? 'all'],
  activeStudents:   ()       => ['reappear-active-students'],
}

// ── Student ───────────────────────────────────────────────────

export function useMyReappearApplications() {
  return useQuery({
    queryKey: KEYS.myApplications(),
    queryFn: async () => {
      const res = await api.fetchMyApplications()
      return res.data ?? []
    },
  })
}

export function useApplyReappear() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.applyReappear,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.myApplications() })
      toastSuccess('Reappear application submitted.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useWithdrawApplication() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.withdrawApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.myApplications() })
      toastSuccess('Application withdrawn.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

// ── HOD ──────────────────────────────────────────────────────

export function useDepartmentApplications(status) {
  return useQuery({
    queryKey: KEYS.department(status),
    queryFn: async () => {
      const res = await api.fetchDepartmentApplications(status)
      return res.data ?? []
    },
  })
}

export function useApproveApplication() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, comment }) => api.approveApplication(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reappear-department'] })
      toastSuccess('Application approved. Original mark invalidated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useRejectApplication() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, comment }) => api.rejectApplication(id, comment),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reappear-department'] })
      toastSuccess('Application rejected.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

// ── Faculty ──────────────────────────────────────────────────

export function useActiveReappearStudents() {
  return useQuery({
    queryKey: KEYS.activeStudents(),
    queryFn: async () => {
      const res = await api.fetchActiveReappearStudents()
      return res.data ?? []
    },
  })
}