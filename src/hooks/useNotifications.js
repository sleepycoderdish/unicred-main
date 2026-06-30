// src/hooks/useNotifications.js
// React Query hooks for in-app notifications.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as api from '@/api/notifications.api'
import useAuthStore from '@/store/auth.store'
import useUiStore from '@/store/ui.store'
import { parseApiError } from '@/utils/errorHandler'

// ── Cache key scoping ──────────────────────────────────────────
// WHY userId IN EVERY KEY:
//   React Query's cache lives in memory for the lifetime of the browser tab.
//   If User A logs out and User B logs in (same tab, no reload), any query
//   cached under a static key like ['notifications'] would be served straight
//   to User B until a background refetch completes — a data-privacy bug.
//
//   Including the userId in every key means User A's cache entries are
//   completely separate from User B's. The logout handler also calls
//   queryClient.clear() (see useAuth.js) for belt-and-suspenders safety,
//   but the per-user keys are the structural guarantee.
const KEYS = {
  list:        (userId) => ['notifications', userId],
  unreadCount: (userId) => ['notifications', 'unread-count', userId],
}

/**
 * useNotifications — paginated list of the current user's notifications.
 *
 * Disabled until we know who is logged in (userId is truthy) so we never
 * fire a network request for an anonymous/unknown user.
 *
 * @param {number} [page=1]
 * @param {number} [limit=20]
 * @returns {{ notifications: Array, pagination: Object }}
 */
export function useNotifications(page = 1, limit = 20) {
  // Scope the cache key to the logged-in user's id
  const userId = useAuthStore(s => s.user?.userId)

  return useQuery({
    queryKey: [...KEYS.list(userId), page, limit],
    queryFn: async () => {
      const res = await api.fetchNotifications(page, limit)
      // Backend envelope: { success, data: { notifications, pagination } }
      // res is that full envelope, so res.data is { notifications, pagination }
      return res.data ?? { notifications: [], pagination: {} }
    },
    // Don't fire until we know who's asking — avoids leaking anonymous requests
    // and prevents hitting the endpoint before the token is available
    enabled: !!userId,
  })
}

/**
 * useUnreadCount — how many notifications are unread right now.
 *
 * POLLING STRATEGY:
 *   refetchInterval: 60000  → re-fetch every 60 s automatically.
 *   refetchOnWindowFocus: true → re-fetch immediately when the user
 *     switches back to the tab (covers the common "went to another tab,
 *     came back" case without hammering the server while the tab is idle).
 *   Tradeoff: unread count can be up to 60 s stale when the tab is
 *   active, but this is much cheaper than polling every few seconds.
 *   Real-time push (WebSocket) would eliminate this lag entirely —
 *   add that when the backend supports it.
 *
 * @returns {number} unreadCount
 */
export function useUnreadCount() {
  const userId = useAuthStore(s => s.user?.userId)

  return useQuery({
    queryKey: KEYS.unreadCount(userId),
    queryFn: async () => {
      const res = await api.fetchUnreadCount()
      // res.data is { unreadCount: N }
      return res.data?.unreadCount ?? 0
    },
    refetchInterval:      60000, // poll every 60 s
    refetchOnWindowFocus: true,  // also re-fetch on tab focus
    // Don't start polling until we have a logged-in user
    enabled: !!userId,
  })
}

/**
 * useMarkNotificationRead — mark a single notification as read.
 * Invalidates both the notification list and the unread count badge,
 * using the current user's scoped keys so we never touch another user's cache.
 */
export function useMarkNotificationRead() {
  const qc     = useQueryClient()
  const userId = useAuthStore(s => s.user?.userId)

  return useMutation({
    mutationFn: (id) => api.markNotificationRead(id),
    onSuccess: () => {
      // Refresh the list so the row updates to "read" style,
      // and refresh the badge count so it decrements.
      qc.invalidateQueries({ queryKey: KEYS.list(userId) })
      qc.invalidateQueries({ queryKey: KEYS.unreadCount(userId) })
    },
    // No error toast — the read action is low-stakes, silently swallow failures.
  })
}

/**
 * useMarkAllNotificationsRead — mark every notification as read in one request.
 * Shows a success toast and refreshes both caches under the current user's keys.
 */
export function useMarkAllNotificationsRead() {
  const qc     = useQueryClient()
  const userId = useAuthStore(s => s.user?.userId)
  const { toastSuccess, toastError } = useUiStore()

  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.list(userId) })
      qc.invalidateQueries({ queryKey: KEYS.unreadCount(userId) })
      toastSuccess('All notifications marked as read.')
    },
    onError: (err) => toastError(parseApiError(err).message),
  })
}
