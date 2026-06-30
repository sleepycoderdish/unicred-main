// src/hooks/useStudentProfile.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as profileApi from '@/api/studentProfile.api'
import * as departmentsApi from '@/api/departments.api'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

const KEYS = {
  myProfile:   () => ['student-profile', 'me'],
  departments: () => ['departments'],
}

/**
 * useMyStudentProfile
 * Fetches the logged-in student's profile.
 * data === null means the profile hasn't been created yet,
 * so the page should show the creation form instead of the read-only view.
 */
export function useMyStudentProfile() {
  return useQuery({
    queryKey: KEYS.myProfile(),
    queryFn: async () => {
      const res = await profileApi.fetchMyStudentProfile()
      return res.data ?? null   // null = not created yet
    },
  })
}

/**
 * useDepartments
 * Loads the department list for the profile form's dropdown.
 */
export function useDepartments() {
  return useQuery({
    queryKey: KEYS.departments(),
    queryFn: async () => {
      const res = await departmentsApi.fetchDepartments()
      return res.data ?? []
    },
  })
}

/**
 * useCreateStudentProfile
 * One-time submit of the student profile form.
 * On success, refreshes the cached profile so the page
 * flips from "form" to "read-only locked view" automatically.
 */
export function useCreateStudentProfile() {
  const qc = useQueryClient()
  const { toastSuccess, toastError } = useUiStore()
  return useMutation({
    mutationFn: profileApi.createMyStudentProfile,
    onSuccess: () => {
      // Re-fetch the profile — now it exists, so the UI locks.
      qc.invalidateQueries({ queryKey: KEYS.myProfile() })
      toastSuccess('Profile submitted. Your details are now locked.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}