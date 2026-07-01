// src/hooks/useAchievements.js
//
// React Query hooks for the Achievements feature.
//
// Why hooks + React Query instead of calling the api file directly from a
// component?
//   - useQuery caches the response, tracks loading/error state for us, and
//     can auto-refetch — we don't have to write that logic by hand.
//   - useMutation is for anything that CHANGES data (create/edit/delete).
//     After a mutation succeeds we tell React Query which cached queries
//     are now stale via `queryClient.invalidateQueries(...)`, so lists
//     refresh automatically instead of showing old data.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as achievementsApi from "../api/achievements.api";

// Central place for the query keys used by this feature. Keeping them in
// one object avoids typos like "achivements" breaking the cache silently.
const KEYS = {
  my: (params) => ["achievements", "my", params],
  detail: (id) => ["achievements", "detail", id],
  assigned: (params) => ["achievements", "assigned", params],
  review: (id) => ["achievements", "review", id],
  department: (params) => ["achievements", "department", params],
};

/**
 * useMyAchievements
 * Student: paginated list of their own achievements.
 * `params` = { page, limit }
 */
export function useMyAchievements(params = {}) {
  return useQuery({
    queryKey: KEYS.my(params),
    // .data.data because the api layer returns the FULL envelope
    // ({ success, message, data }) — we only want the payload here.
    queryFn: () => achievementsApi.getMyAchievements(params).then((res) => res.data),
  });
}

/**
 * useAchievement
 * Student: single achievement detail (with review rows).
 * `enabled` guards against calling the API with an undefined id, e.g.
 * before the route param has loaded.
 */
export function useAchievement(id) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => achievementsApi.getAchievementById(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

/**
 * useCreateAchievement
 * Student: submit a new achievement. On success we invalidate the "my
 * achievements" list so the new item shows up without a manual refresh.
 */
export function useCreateAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: achievementsApi.createAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements", "my"] });
    },
  });
}

/**
 * useUpdateAchievement
 * Student: edit a pending achievement's fields.
 */
export function useUpdateAchievement(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (fields) => achievementsApi.updateAchievement(id, fields),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ["achievements", "my"] });
    },
  });
}

/**
 * useDeleteAchievement
 * Student: delete a pending achievement.
 */
export function useDeleteAchievement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: achievementsApi.deleteAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements", "my"] });
    },
  });
}

/**
 * useAddReviewers
 * Student: add faculty reviewers to a pending achievement.
 */
export function useAddReviewers(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyIds) => achievementsApi.addReviewers(id, facultyIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

/**
 * useRemoveReviewer
 * Student: remove one faculty reviewer from a pending achievement.
 */
export function useRemoveReviewer(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (facultyId) => achievementsApi.removeReviewer(id, facultyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
    },
  });
}

/**
 * useAssignedAchievements
 * Faculty/HOD: this faculty's own review queue.
 * `params` = { status, page, limit }
 */
export function useAssignedAchievements(params = {}) {
  return useQuery({
    queryKey: KEYS.assigned(params),
    queryFn: () => achievementsApi.getAssignedAchievements(params).then((res) => res.data),
  });
}

/**
 * useAchievementReview
 * Faculty/HOD: the review screen data for one achievement (own verdict +
 * other faculties' verdicts).
 */
export function useAchievementReview(id) {
  return useQuery({
    queryKey: KEYS.review(id),
    queryFn: () => achievementsApi.getAchievementReview(id).then((res) => res.data),
    enabled: Boolean(id),
  });
}

/**
 * useVerifyAchievement
 * Faculty/HOD: approve an achievement. Invalidates both the review screen
 * and this faculty's queue so the item moves out of "pending".
 */
export function useVerifyAchievement(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (remark) => achievementsApi.verifyAchievement(id, remark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.review(id) });
      queryClient.invalidateQueries({ queryKey: ["achievements", "assigned"] });
    },
  });
}

/**
 * useRejectAchievement
 * Faculty/HOD: reject an achievement. `remark` is required — validate
 * before calling `.mutate(remark)`.
 */
export function useRejectAchievement(id) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (remark) => achievementsApi.rejectAchievement(id, remark),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.review(id) });
      queryClient.invalidateQueries({ queryKey: ["achievements", "assigned"] });
    },
  });
}

/**
 * useDepartmentAchievements
 * HOD: read-only department-wide achievement list.
 * `params` = { status, page, limit }
 */
export function useDepartmentAchievements(params = {}) {
  return useQuery({
    queryKey: KEYS.department(params),
    queryFn: () => achievementsApi.getDepartmentAchievements(params).then((res) => res.data),
  });
}