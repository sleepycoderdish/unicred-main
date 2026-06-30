// src/api/studentProfile.api.js
import apiClient from '@/api/client'

/**
 * GET /api/students/profile/me
 * Check if the logged-in student has already completed their profile.
 * RESPONSE: { data: null } if not yet created, or { data: {...student} } if it exists.
 */
export async function fetchMyStudentProfile() {
  const res = await apiClient.get('/api/students/profile/me')
  return res.data
}

/**
 * POST /api/students/profile
 * Submit the one-time student profile form.
 * BODY: { departmentId, rollNo, branch, batchYear, graduationYear, currentSemester }
 * 400 if profile already exists, or roll number is taken, or department invalid.
 */
export async function createMyStudentProfile(payload) {
  const res = await apiClient.post('/api/students/profile', payload)
  return res.data
}