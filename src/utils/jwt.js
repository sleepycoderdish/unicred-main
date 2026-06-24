// src/utils/jwt.js
// ─────────────────────────────────────────────────────────────
// Lightweight JWT utilities.
// We decode the JWT payload ourselves (no jwt-decode library needed)
// because we only need the payload — we're NOT verifying the signature
// on the frontend. Signature verification is always done by the backend.
// ─────────────────────────────────────────────────────────────

/**
 * decodeJwt — decodes a JWT and returns its payload as an object.
 *
 * A JWT is three Base64URL-encoded parts joined by dots:
 *   header.payload.signature
 * We only decode the payload (index 1).
 *
 * @param {string} token - Raw JWT string
 * @returns {{ userId: number, role: string, schoolId: number, iat: number, exp: number }}
 * @throws {Error} if token is malformed
 */
export function decodeJwt(token) {
  try {
    // Split on "." and take the payload section (index 1)
    const base64Url = token.split('.')[1]
    if (!base64Url) throw new Error('Invalid token structure')

    // Base64URL uses "-" and "_" instead of "+" and "/", and no padding.
    // atob() expects standard Base64, so we convert first.
    const base64 = base64Url
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    // Pad to a multiple of 4 (atob requirement)
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')

    // Decode and parse
    const jsonString = atob(padded)
    return JSON.parse(jsonString)
  } catch (err) {
    throw new Error(`Failed to decode JWT: ${err.message}`)
  }
}

/**
 * isTokenExpired — checks if a JWT's exp claim has passed.
 *
 * @param {string} token - Raw JWT string
 * @returns {boolean} true if expired or malformed
 */
export function isTokenExpired(token) {
  try {
    const { exp } = decodeJwt(token)
    if (!exp) return true
    // exp is in seconds; Date.now() is in milliseconds
    return Date.now() / 1000 > exp
  } catch {
    return true // Treat malformed tokens as expired
  }
}

/**
 * getTokenRole — extracts the role from a JWT without full decode overhead.
 *
 * @param {string} token
 * @returns {string|null}
 */
export function getTokenRole(token) {
  try {
    return decodeJwt(token).role ?? null
  } catch {
    return null
  }
}
