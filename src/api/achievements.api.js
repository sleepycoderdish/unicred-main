// src/api/achievements.api.js
//
// This file talks to the backend's /api/achievements routes.
// It does NOT contain any UI code — it only sends requests and hands back
// the response. React components never call this file directly; they go
// through the hooks in hooks/useAchievements.js instead.
//
// Every function here returns `response.data`, which is the backend's
// standard envelope: { success, message, data }. The hooks are the ones
// that unwrap `.data` to get the actual payload.

import client from "./client"; // shared axios instance (adds the auth token, handles 401 refresh)

/**
 * createAchievement
 * Student creates a new achievement and sends it to one or more faculty
 * members for verification.
 *
 * @param {Object} payload
 * @param {string} payload.title - required
 * @param {string} payload.category - required
 * @param {string} [payload.description]
 * @param {string} [payload.certificateUrl] - must be http(s)
 * @param {string} [payload.proofUrl] - must be http(s)
 * @param {number} [payload.sessionId]
 * @param {number[]} payload.facultyIds - required, non-empty, Faculty.id values
 * @returns {Promise<Object>} the standard { success, message, data } envelope
 */
export const createAchievement = (payload) =>
  client.post("/api/achievements", payload).then((res) => res.data);

/**
 * getMyAchievements
 * Student's own paginated achievement list.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getMyAchievements = (params = {}) =>
  client.get("/api/achievements/my", { params }).then((res) => res.data);

/**
 * getAchievementById
 * One achievement owned by the logged-in student, including its review rows.
 *
 * @param {number} id
 */
export const getAchievementById = (id) =>
  client.get(`/api/achievements/${id}`).then((res) => res.data);

/**
 * updateAchievement
 * Edit text/URL fields on an achievement. Backend only allows this while
 * status === "pending" — always check status on the frontend too so the
 * button is disabled before the request is even sent.
 *
 * @param {number} id
 * @param {Object} fields - only send the fields that changed
 */
export const updateAchievement = (id, fields) =>
  client.patch(`/api/achievements/${id}`, fields).then((res) => res.data);

/**
 * deleteAchievement
 * Delete a pending achievement. Review rows cascade away on the backend.
 *
 * @param {number} id
 */
export const deleteAchievement = (id) =>
  client.delete(`/api/achievements/${id}`).then((res) => res.data);

/**
 * addReviewers
 * Add one or more faculty reviewers to a pending achievement.
 *
 * @param {number} id
 * @param {number[]} facultyIds
 */
export const addReviewers = (id, facultyIds) =>
  client
    .post(`/api/achievements/${id}/reviewers`, { facultyIds })
    .then((res) => res.data);

/**
 * removeReviewer
 * Remove one faculty reviewer from a pending achievement. The backend
 * blocks this if that faculty already responded, or if it's the last
 * remaining reviewer.
 *
 * @param {number} id
 * @param {number} facultyId
 */
export const removeReviewer = (id, facultyId) =>
  client
    .delete(`/api/achievements/${id}/reviewers/${facultyId}`)
    .then((res) => res.data);

/**
 * getAssignedAchievements
 * Faculty/HOD: the logged-in faculty's own review queue.
 *
 * @param {Object} [params]
 * @param {"pending"|"approved"|"rejected"|"all"} [params.status="pending"]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getAssignedAchievements = (params = {}) =>
  client.get("/api/achievements/assigned", { params }).then((res) => res.data);

/**
 * getAchievementReview
 * Faculty/HOD: full review screen for one achievement — includes this
 * faculty's own verdict plus every OTHER assigned faculty's verdict.
 *
 * @param {number} id
 */
export const getAchievementReview = (id) =>
  client.get(`/api/achievements/${id}/review`).then((res) => res.data);

/**
 * verifyAchievement
 * Faculty/HOD approves the achievement (records THIS faculty's verdict).
 * One approval from any assigned faculty is enough to mark the whole
 * achievement "approved".
 *
 * @param {number} id
 * @param {string} [remark] - optional note shown to the student
 */
export const verifyAchievement = (id, remark) =>
  client.patch(`/api/achievements/${id}/verify`, { remark }).then((res) => res.data);

/**
 * rejectAchievement
 * Faculty/HOD rejects the achievement. `remark` is REQUIRED by the backend
 * — validate this on the frontend before sending to avoid a 400.
 *
 * @param {number} id
 * @param {string} remark - required
 */
export const rejectAchievement = (id, remark) =>
  client.patch(`/api/achievements/${id}/reject`, { remark }).then((res) => res.data);

/**
 * getDepartmentAchievements
 * HOD: read-only view of every achievement in their department.
 *
 * @param {Object} [params]
 * @param {"pending"|"approved"|"rejected"} [params.status] - omit for all
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getDepartmentAchievements = (params = {}) =>
  client.get("/api/achievements/department", { params }).then((res) => res.data);