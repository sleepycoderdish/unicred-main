// src/hooks/useStudents.js
// React Query hook for listing students (used by HOD student registration).

import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/students.api'

// ─────────────────────────────────────────────────────────────
// pickArray — always return an array from whatever the backend sent.
// Defined locally so this file has no extra dependency to go missing.
// Handles: [ ... ] | { data: [...] } | { data: { data: [...] } } |
//          { students: [...] } (first array-valued property it finds).
// ─────────────────────────────────────────────────────────────
function pickArray(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  const firstArray = (obj) =>
    obj && typeof obj === 'object' ? Object.values(obj).find(Array.isArray) : undefined
  return firstArray(res) || firstArray(res?.data) || []
}

/**
 * useStudents — fetches students of a department, then narrows to a
 * specific batch + semester.
 *
 * How filtering works:
 *   1. GET /api/students/:departmentId (department goes in the path).
 *   2. batchYear + semesterNumber are sent as query params (backend may use them).
 *   3. We ALSO filter the returned list on the client as a safety net, so the
 *      result stays correct even if the backend ignores a query param, and a
 *      valid student is never wrongly hidden when a field is missing.
 *
 * Disabled until departmentId + batchYear + semester are all present.
 *
 * @param {{ departmentId?: number, batchYear?: number, semesterNumber?: number }} filters
 * @returns TanStack Query result; data is always an array.
 */
export function useStudents(filters = {}) {
  const { departmentId, batchYear, semesterNumber } = filters

  return useQuery({
    queryKey: ['students', {
      departmentId:   departmentId ?? null,
      batchYear:      batchYear ?? null,
      semesterNumber: semesterNumber ?? null,
    }],
    queryFn: async () => {
      const res  = await api.fetchStudents(departmentId, { batchYear, semesterNumber })
      const list = pickArray(res)

      // Client-side narrowing. Values from the form arrive as strings, so we
      // compare with Number().
      return list.filter((st) => {
        if (batchYear != null && st.batchYear != null && Number(st.batchYear) !== Number(batchYear)) {
          return false
        }
        if (semesterNumber != null && st.currentSemester != null && Number(st.currentSemester) !== Number(semesterNumber)) {
          return false
        }
        return true
      })
    },
    enabled: !!departmentId && !!batchYear && !!semesterNumber,
  })
}