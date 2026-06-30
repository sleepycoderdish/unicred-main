// src/utils/errorHandler.js
// ─────────────────────────────────────────────────────────────
// Normalises all API / network errors into a consistent shape
// so every catch block doesn't need its own if/else logic.
//
// Backend error response shape (assumed):
//   { message: string, code?: string, errors?: Record<string, string> }
// ─────────────────────────────────────────────────────────────

/**
 * parseApiError — extracts a human-readable message from any thrown error.
 *
 * Priority order:
 *  1. Backend response body message
 *  2. HTTP status fallback messages
 *  3. Network / unknown error
 *
 * @param {unknown} err - The raw error from a try/catch block
 * @returns {{ message: string, status: number|null, code: string|null, fieldErrors: Object, data: any }}
 */
export function parseApiError(err) {
  // Axios error with a response from the server
  if (err?.response) {
    const { status, data } = err.response

    // Field-level validation errors from backend (e.g. { email: "Already taken" })
    const fieldErrors = data?.errors ?? {}

    // Backend-provided message takes priority
    const message =
      data?.message ||
      data?.error ||
      getStatusMessage(status)

    // A machine-readable code if the backend sends one (e.g. "EMAIL_NOT_VERIFIED").
    // Having this lets callers branch on the code instead of fragile message text.
    const code = data?.code ?? null

    return { message, status, code, fieldErrors, data }
  }

  // Axios error with no response (network down, CORS, timeout)
  if (err?.request) {
    return {
      message: 'Unable to reach the server. Check your internet connection.',
      status: null,
      code: null,
      fieldErrors: {},
      data: null,
    }
  }

  // Generic JS error or unknown
  return {
    message: err?.message || 'An unexpected error occurred. Please try again.',
    status: null,
    code: null,
    fieldErrors: {},
    data: null,
  }
}

/**
 * getStatusMessage — returns a generic message for common HTTP status codes.
 * Used as fallback when the backend doesn't send a message body.
 *
 * @param {number} status
 * @returns {string}
 */
function getStatusMessage(status) {
  const messages = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. This resource may already exist.',
    422: 'Validation failed. Please review the highlighted fields.',
    429: 'Too many requests. Please wait a moment and try again.',
    500: 'A server error occurred. Please try again later.',
    502: 'Server is temporarily unavailable. Please try again.',
    503: 'Service is under maintenance. Please try again shortly.',
  }
  return messages[status] || `Request failed with status ${status}.`
}