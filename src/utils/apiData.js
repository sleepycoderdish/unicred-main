// src/utils/apiData.js
// ─────────────────────────────────────────────────────────────
// Tiny helpers that pull the real payload out of an API response,
// no matter which shape the backend used.
//
// Why this exists:
//   Most endpoints return the standard envelope { success, message, data }.
//   But a few list endpoints sometimes return the array directly, or even
//   double-wrap it as { data: { data: [...] } }. If the UI assumes only one
//   shape, a perfectly valid response can show up as "empty" — which is
//   exactly the kind of bug where "an active session exists but the list is
//   empty". These helpers normalise all of those cases.
// ─────────────────────────────────────────────────────────────

/**
 * unwrapList — always returns an array from an API response.
 *
 * Handles:
 *   [ ... ]                         → returns it as-is
 *   { data: [ ... ] }               → returns the inner array
 *   { data: { data: [ ... ] } }     → returns the deepest array
 *   anything else / null            → returns []
 *
 * @param {any} res - the value returned by an api.* function
 * @returns {Array}
 */
export function unwrapList(res) {
  if (Array.isArray(res)) return res
  if (Array.isArray(res?.data)) return res.data
  if (Array.isArray(res?.data?.data)) return res.data.data
  return []
}

/**
 * unwrapOne — always returns a single object (or null) from an API response.
 *
 * Handles:
 *   { id, ... }                     → returns it as-is
 *   { data: { ... } }               → returns the inner object
 *   { data: { data: { ... } } }     → returns the deepest object
 *
 * @param {any} res - the value returned by an api.* function
 * @returns {object|null}
 */
export function unwrapOne(res) {
  if (res == null) return null
  // If it's the envelope, step into .data (possibly twice).
  if (res.data?.data !== undefined) return res.data.data
  if (res.data !== undefined && !('success' in res.data)) return res.data
  if (res.data !== undefined) return res.data
  return res
}