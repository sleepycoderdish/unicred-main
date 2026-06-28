// src/api/assignments.api.js
// Faculty assignment endpoints.

import apiClient from '@/api/client'

/**
 * GET /api/faculty-assignments/my
 * Returns all subjects assigned to the logged-in faculty member.
 * RESPONSE: { data: [{ id, sessionId, subjectId, semesterNumber, batchYear,
 *                      subject: { id, name, courseCode, credits, subjectType, totalMarks, passingMarks },
 *                      session: { id, name, status, academicYear } }] }
 */
export async function fetchMyAssignments() {
  const res = await apiClient.get('/api/faculty-assignments/my')
  return res.data
}

/**
 * GET /api/assessments/my-subjects
 * Returns subjects the faculty can upload internal assessment marks for.
 * RESPONSE: { data: [{ subject, session, semesterNumber, batchYear }] }
 */
export async function fetchAssessmentSubjects() {
  const res = await apiClient.get('/api/assessments/my-subjects')
  return res.data
}

/**
 * GET /api/assessments?subjectId=x&sessionId=x
 * Fetch uploaded assessments for a subject in a session.
 */
export async function fetchAssessments(subjectId, sessionId) {
  const res = await apiClient.get('/api/assessments', { params: { subjectId, sessionId } })
  return res.data
}

/**
 * POST /api/assessments
 * Upload internal assessment marks for a student.
 * BODY: { subjectId, sessionId, studentId, assessmentType, title, marks, maxMarks }
 * assessmentType: quiz | assignment | midterm | lab | viva | practical
 * Constraint: marks <= maxMarks (validated frontend + backend)
 */
export async function createAssessment(payload) {
  const res = await apiClient.post('/api/assessments', payload)
  return res.data
}

/**
 * GET /api/studentReg/session/:sessionId
 * Get all students registered in a session — used to build the mark entry roster.
 * RESPONSE: { data: [{ student: { id, rollNo, user: { name } }, semesterNumber, batchYear }] }
 */
export async function fetchSessionStudents(sessionId) {
  const res = await apiClient.get(`/api/studentReg/session/${sessionId}`)
  return res.data
}