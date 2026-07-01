// src/hooks/useInternships.js
//
// React Query hooks for the Internships feature. Same pattern as
// useAchievements.js:
//   - useQuery = for READING data. Handles caching + loading/error state
//     for us automatically.
//   - useMutation = for CHANGING data (create/edit/delete/link). After a
//     mutation succeeds, we call queryClient.invalidateQueries(...) to
//     tell React Query "this cached data is now stale, go refetch it" —
//     that's what makes lists update on screen without a manual reload.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as internshipsApi from "../api/internships.api";

// Central place for the query keys this feature uses. A "query key" is
// just an array React Query uses to identify and cache a piece of data —
// keeping them in one object avoids typos silently breaking the cache.
const KEYS = {
  my: (params) => ["internships", "my", params],
  detail: (id) => ["internships", "detail", id],
  department: (params) => ["internships", "department", params],
};

/**
 * useMyInternships
 * Student: paginated list of their own internships (each with the linked
 * achievement's status, or null).
 * @param {Object} params - { page, limit }
 */
export function useMyInternships(params = {}) {
  return useQuery({
    queryKey: KEYS.my(params),
    // .then((res) => res.data) unwraps the backend's envelope
    // ({ success, message, data }) down to just the payload.
    queryFn: () => internshipsApi.getMyInternships(params).then((res) => res.data),
  });
}

/**
 * useInternship
 * Student: single internship detail.
 * `enabled: Boolean(id)` stops the query from firing before an id exists
 * (e.g. while the route is still loading).
 */
export function useInternship(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => internshipsApi.getInternshipById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

/**
 * useCreateInternship
 * Student: add a new internship. On success, the "my internships" list
 * is marked stale so the new item appears right away.
 */
export function useCreateInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: internshipsApi.createInternship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internships", "my"] });
    },
  });
}

/**
 * useUpdateInternship
 * Student: edit an internship's fields. Internships have no lifecycle
 * lock, so this can be called any time (unlike achievement edits).
 */
export function useUpdateInternship(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => internshipsApi.updateInternship(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["internships", "my"] });
    },
  });
}

/**
 * useDeleteInternship
 * Student: delete an internship record.
 */
export function useDeleteInternship() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: internshipsApi.deleteInternship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["internships", "my"] });
    },
  });
}

/**
 * useLinkAchievement
 * Student: attach an existing achievement to an already-created
 * internship. Separate from useUpdateInternship because the backend
 * gives this its own dedicated endpoint (with its own 409 "already
 * linked" rule).
 */
export function useLinkAchievement(internshipId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (achievementId) =>
      internshipsApi.linkAchievement(internshipId, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(internshipId) });
      queryClient.invalidateQueries({ queryKey: ["internships", "my"] });
    },
  });
}

/**
 * useDepartmentInternships
 * HOD: read-only department-wide internship list.
 * @param {Object} params - { page, limit }
 */
export function useDepartmentInternships(params = {}) {
  return useQuery({
    queryKey: KEYS.department(params),
    queryFn: () => internshipsApi.getDepartmentInternships(params).then((res) => res.data),
  });
}