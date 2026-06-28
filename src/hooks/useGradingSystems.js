// src/hooks/useGradingSystems.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/grading.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  all: () => ['grading-systems'],
}

export function useGradingSystems() {
  return useQuery({
    queryKey: KEYS.all(),
    queryFn: async () => {
      const res = await api.fetchGradingSystems()
      return res.data ?? []
    },
  })
}

export function useCreateGradingSystem() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: api.createGradingSystem,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      toastSuccess('Grading system created and activated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useUpdateGradingSystem() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: ({ id, ...payload }) => api.updateGradingSystem(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      toastSuccess('Grading system updated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}

export function useActivateGradingSystem() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: (id) => api.activateGradingSystem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.all() })
      toastSuccess('Grading system activated.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}