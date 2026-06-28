// src/api/grading.api.js
// Grading system CRUD — Admin only.
// One grading system is active at a time.
// Changing it never affects already-published results.

import apiClient from '@/api/client'

const BASE = '/api/grading-systems'

/**
 * GET /api/grading-systems
 * Returns all systems for the school (custom + global default).
 * RESPONSE: { data: [{ id, name, isDefault, isActive, rules: [...] }] }
 */
export async function fetchGradingSystems() {
  const res = await apiClient.get(BASE)
  return res.data
}

/**
 * POST /api/grading-systems
 * Creates a new grading system and immediately makes it active.
 * BODY: { name: string, rules: [{ grade, gradePoint, minMarksPercent, maxMarksPercent }] }
 * RESPONSE: 201 { data: { id, name, isActive, rules } }
 */
export async function createGradingSystem(payload) {
  const res = await apiClient.post(BASE, payload)
  return res.data
}

/**
 * PATCH /api/grading-systems/:id
 * Update name and/or rules. Does NOT touch published results.
 * BODY: { name?: string, rules?: [...] }
 */
export async function updateGradingSystem(id, payload) {
  const res = await apiClient.patch(`${BASE}/${id}`, payload)
  return res.data
}

/**
 * PATCH /api/grading-systems/:id/activate
 * Switch the active system. No body needed.
 * Previous active system is deactivated automatically.
 */
export async function activateGradingSystem(id) {
  const res = await apiClient.patch(`${BASE}/${id}/activate`)
  return res.data
}