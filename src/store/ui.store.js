// src/store/ui.store.js
// ─────────────────────────────────────────────────────────────
// Global UI state: toast notifications and a global page loader.
//
// Toast queue:
//   Each toast has { id, type, message, duration }.
//   Components call addToast() to push a notification.
//   The Toast component polls this store and auto-removes after duration.
//
// Global loader:
//   Used for full-page operations (e.g. initial auth check).
//   Not the same as button-level loading states — those live in local
//   component state.
// ─────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

/** Auto-incrementing ID for toast deduplication */
let toastIdCounter = 0

const useUiStore = create(
  devtools(
    (set, get) => ({
      // ── Toast queue ────────────────────────────────────────
      toasts: [], // Array<{ id, type, message, duration }>

      /**
       * addToast — pushes a new notification to the queue.
       *
       * @param {'success'|'error'|'warning'|'info'} type
       * @param {string} message - Human-readable message
       * @param {number} [duration=4000] - Auto-dismiss delay in ms
       * @returns {number} id - Can be used to manually dismiss early
       */
      addToast: (type, message, duration = 4000) => {
        const id = ++toastIdCounter
        set(
          (state) => ({ toasts: [...state.toasts, { id, type, message, duration }] }),
          false,
          'addToast'
        )
        return id
      },

      /**
       * removeToast — removes a toast by id.
       * Called automatically after duration, or manually on close click.
       * @param {number} id
       */
      removeToast: (id) => {
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'removeToast'
        )
      },

      // ── Shorthand toast helpers ────────────────────────────
      toastSuccess: (msg, duration) => get().addToast('success', msg, duration),
      toastError:   (msg, duration) => get().addToast('error',   msg, duration),
      toastWarning: (msg, duration) => get().addToast('warning', msg, duration),
      toastInfo:    (msg, duration) => get().addToast('info',    msg, duration),

      // ── Global page loader ─────────────────────────────────
      isPageLoading: false,

      /** setPageLoading — show/hide the full-screen spinner */
      setPageLoading: (value) => {
        set({ isPageLoading: value }, false, 'setPageLoading')
      },
    }),
    { name: 'UiStore' }
  )
)

export default useUiStore
