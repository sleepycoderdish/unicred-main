// src/hooks/useFacultyAssignments.js
// ─────────────────────────────────────────────────────────────
// React Query hooks for faculty-subject assignment data,
// from the student's perspective.
// ─────────────────────────────────────────────────────────────

import { useQuery } from '@tanstack/react-query'
import * as api from '@/api/facultyAssignments.api'

const KEYS = {
  // Cache key per subject so each subject has its own isolated cache entry
  facultyForSubject: (subjectId) => ['faculty-for-subject', subjectId],
}

/**
 * useFacultyForSubject — fetch the faculty assigned to a subject for the
 * current student's active session.
 *
 * WHY WE SWALLOW 404s HERE:
 *   The backend returns 404 when no faculty is assigned yet (or the student
 *   has no active session). This is a perfectly normal, expected state —
 *   it just means the HOD hasn't made the assignment yet. If we let React
 *   Query treat this as an error it would trigger the global error toast,
 *   which would confuse students. Instead we catch the 404 and return null
 *   so the UI can show a clean "no faculty assigned" empty state.
 *
 * @param {number|string|null} subjectId - the course/subject id, or null to disable
 * @returns {{ data: { id, faculty: {...} } | null, isLoading: boolean }}
 */
export function useFacultyForSubject(subjectId) {
  return useQuery({
    queryKey: KEYS.facultyForSubject(subjectId),
    queryFn: async () => {
      try {
        const res = await api.fetchFacultyForSubject(subjectId)
        // res is the full backend JSON: { success: true, data: { id, faculty: {...} } }
        // We return res.data so the caller gets { id, faculty: {...} }
        return res?.data ?? null
      } catch (err) {
        // 404 = no assignment exists yet — return null instead of throwing,
        // so the page shows an empty state rather than an error.
        if (err?.response?.status === 404) return null
        // Any other error (500, network, etc.) propagates normally
        throw err
      }
    },
    // Don't run the query at all if we don't have a subjectId yet
    enabled: !!subjectId,
  })
}
