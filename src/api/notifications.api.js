// src/api/notifications.api.js
// In-app notification endpoints. Notifications are created automatically
// by the backend (e.g. when results are published); this file only covers
// fetching and marking them read from the frontend.

import apiClient from '@/api/client'

/**
 * GET /api/notifications?page=1&limit=20
 * Fetch the current user's notifications, newest first.
 * QUERY PARAMS: page (int, default 1), limit (int, default 20)
 * RESPONSE: { data: { notifications: [{ id, userId, type, message, isRead, createdAt, link, readAt }],
 *                      pagination: { total, page, limit, totalPages } } }
 *
 * @param {number} [page=1]
 * @param {number} [limit=20]
 */
export async function fetchNotifications(page = 1, limit = 20) {
  const res = await apiClient.get('/api/notifications', { params: { page, limit } })
  return res.data
}

/**
 * GET /api/notifications/unread-count
 * Returns the total number of unread notifications for the current user.
 * RESPONSE: { data: { unreadCount: N } }
 */
export async function fetchUnreadCount() {
  const res = await apiClient.get('/api/notifications/unread-count')
  return res.data
}

/**
 * PATCH /api/notifications/:id/read
 * Mark a single notification as read. Idempotent — already-read ones
 * remain read with no error.
 * RESPONSE: { data: { id, isRead: true, readAt: "..." } }
 *
 * @param {number|string} id - notification id
 */
export async function markNotificationRead(id) {
  const res = await apiClient.patch(`/api/notifications/${id}/read`)
  return res.data
}

/**
 * PATCH /api/notifications/read-all
 * Mark every unread notification for the current user as read in one call.
 * RESPONSE: { data: { updated: N } }
 */
export async function markAllNotificationsRead() {
  const res = await apiClient.patch('/api/notifications/read-all')
  return res.data
}
