// src/api/internships.api.js
//
// This file talks to the backend's /api/internships routes.
// It has NO UI code — it only sends requests and hands back whatever the
// backend replies with. Components never import this file directly; they
// go through the hooks in hooks/useInternships.js instead.
//
// Every function returns `response.data`, which is the backend's standard
// envelope: { success, message, data }. The hooks unwrap `.data` to get
// the actual payload (the internship object, the list, etc.)
//
// Key thing to know about internships: unlike achievements, they have
// NO pending/approved/rejected lifecycle of their own. An internship's
// "verification badge" is just whatever status the LINKED achievement
// has (or nothing, if no achievement is linked). That's why you'll see
// `achievement: {...} | null` inside internship responses below.

import client from "./client"; // shared axios instance (adds the auth token, handles 401 refresh)

/**
 * createInternship
 * Student adds a new internship record. Linking it to an achievement is
 * optional here — it can also be done later with linkAchievement().
 *
 * @param {Object} payload
 * @param {string} payload.companyName - required, non-empty
 * @param {string} payload.role - required, non-empty
 * @param {string} [payload.startDate] - ISO date string, e.g. "2026-05-01"
 * @param {string} [payload.endDate] - ISO date string, must be >= startDate
 * @param {number} [payload.stipend] - must be >= 0
 * @param {string} [payload.offerLetterUrl] - must be http(s)
 * @param {string} [payload.certificateUrl] - must be http(s)
 * @param {number} [payload.achievementId] - must be this student's own achievement, and not already linked to a different internship
 * @returns {Promise<Object>} the standard { success, message, data } envelope
 */
export const createInternship = (payload) =>
  client.post("/api/internships", payload).then((res) => res.data);

/**
 * getMyInternships
 * Student's own paginated internship list. Each item includes the linked
 * achievement (or null) so the UI can show its verification status.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getMyInternships = (params = {}) =>
  client.get("/api/internships/my", { params }).then((res) => res.data);

/**
 * getInternshipById
 * One internship owned by the logged-in student.
 *
 * @param {number} id
 */
export const getInternshipById = (id) =>
  client.get(`/api/internships/${id}`).then((res) => res.data);

/**
 * updateInternship
 * Edit an internship's fields. Unlike achievements, there's no "pending
 * only" lock here — internships can be edited any time since they don't
 * go through a review lifecycle.
 *
 * @param {number} id
 * @param {Object} fields - only send the fields that changed. Send `stipend: null` to clear it.
 */
export const updateInternship = (id, fields) =>
  client.patch(`/api/internships/${id}`, fields).then((res) => res.data);

/**
 * deleteInternship
 * Delete an internship record. No status restriction.
 *
 * @param {number} id
 */
export const deleteInternship = (id) =>
  client.delete(`/api/internships/${id}`).then((res) => res.data);

/**
 * linkAchievement
 * Attach an existing achievement to an internship AFTER it was created
 * (e.g. the student adds the internship first, then later links the
 * hackathon win that got them the offer).
 *
 * @param {number} internshipId
 * @param {number} achievementId - required; must be this student's achievement and not already linked elsewhere
 */
export const linkAchievement = (internshipId, achievementId) =>
  client
    .patch(`/api/internships/${internshipId}/link-achievement`, { achievementId })
    .then((res) => res.data);

/**
 * getDepartmentInternships
 * HOD: read-only view of every internship in their department, each
 * including the student's name.
 *
 * @param {Object} [params]
 * @param {number} [params.page=1]
 * @param {number} [params.limit=20]
 */
export const getDepartmentInternships = (params = {}) =>
  client.get("/api/internships/department", { params }).then((res) => res.data);