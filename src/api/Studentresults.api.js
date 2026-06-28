// src/api/studentResults.api.js
// Student-facing result and CGPA endpoints.
// All routes scoped to the logged-in student via their token.

import apiClient from '@/api/client'

/**
 * GET /api/students/results
 * All published results across all sessions.
 * RESPONSE: { data: [{ marks, grade, gradePoint, isPassed,
 *                      subject: { name, courseCode, credits },
 *                      publication: { semesterNumber, publishedAt } }] }
 */
export async function fetchAllResults() {
  const res = await apiClient.get('/api/students/results')
  return res.data
}

/**
 * GET /api/students/results/:sessionId
 * Results filtered to one session.
 * Same shape as fetchAllResults items.
 */
export async function fetchResultsBySession(sessionId) {
  const res = await apiClient.get(`/api/students/results/${sessionId}`)
  return res.data
}

/**
 * GET /api/students/cgpa
 * SGPA + CGPA history across all semesters.
 * RESPONSE: { data: [{ semesterId, sgpa, cgpa, totalCredits,
 *                      classAverageCgpa, semester: { semesterNumber } }] }
 * Note: never compute CGPA/SGPA on the frontend — always read from here.
 */
export async function fetchCgpaHistory() {
  const res = await apiClient.get('/api/students/cgpa')
  return res.data
}