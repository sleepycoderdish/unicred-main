// src/components/layout/NotificationBell.jsx
// ─────────────────────────────────────────────────────────────
// Topbar notification bell: shows unread badge count, toggles a
// dropdown panel listing recent notifications with mark-as-read actions.
// ─────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from 'react'
import { useNavigate }                 from 'react-router-dom'
import { GlassCard }                   from '@/components/ui/GlassCard'
import { formatDate }                  from '@/utils/formatters'
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/useNotifications'

// Bell icon SVG — same stroke-based style as AppShell.jsx's NavIcon
function BellIcon() {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  )
}

export function NotificationBell() {
  // Whether the dropdown is open
  const [open, setOpen] = useState(false)

  // Ref on the wrapper so we can detect clicks outside the dropdown
  const wrapperRef = useRef(null)

  const navigate = useNavigate()

  // ── Data ───────────────────────────────────────────────────
  // Unread badge — refetches every 60 s and on window focus (see hook for tradeoff notes)
  const { data: unreadCount = 0 } = useUnreadCount()

  // First 10 notifications for the dropdown list
  const { data: notifData, isLoading } = useNotifications(1, 10)
  const notifications = notifData?.notifications ?? []

  // Mutations
  const markRead    = useMarkNotificationRead()
  const markAllRead = useMarkAllNotificationsRead()

  // ── Close on outside click ─────────────────────────────────
  // When the dropdown is open, listen for mousedown on the whole document.
  // If the click lands outside our wrapper, close the dropdown.
  useEffect(() => {
    if (!open) return
    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  // ── Close on Escape key ────────────────────────────────────
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open])

  // ── Notification row click handler ─────────────────────────
  function handleNotificationClick(notification) {
    // Mark as read first (only if it isn't already)
    if (!notification.isRead) {
      markRead.mutate(notification.id)
    }
    // Navigate to the linked page if one was provided
    if (notification.link) {
      navigate(notification.link)
    }
    setOpen(false)
  }

  // Format badge: cap at "9+" so it doesn't overflow the circle
  const badgeLabel = unreadCount > 9 ? '9+' : String(unreadCount)

  return (
    // Wrapper is position:relative so the dropdown can anchor to it
    <div ref={wrapperRef} style={{ position: 'relative', display: 'inline-block' }}>

      {/* ── Bell button ──────────────────────────────────── */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Notifications"
        style={{
          position:       'relative',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          width:           38,
          height:          38,
          borderRadius:   'var(--radius-sm)',
          background:      open ? 'var(--bg-elevated)' : 'transparent',
          border:         '1px solid transparent',
          cursor:         'pointer',
          color:          'var(--text-secondary)',
          transition:     'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-elevated)'
          e.currentTarget.style.color      = 'var(--text-primary)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = open ? 'var(--bg-elevated)' : 'transparent'
          e.currentTarget.style.color      = open ? 'var(--text-primary)' : 'var(--text-secondary)'
        }}
      >
        <BellIcon />

        {/* Unread badge — only shown when count > 0 */}
        {unreadCount > 0 && (
          <span style={{
            position:       'absolute',
            top:             2,
            right:           2,
            minWidth:        16,
            height:          16,
            borderRadius:    99,
            background:     'var(--danger, #ef4444)',
            color:          '#fff',
            fontSize:       '0.6rem',
            fontWeight:      700,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            padding:        '0 3px',
            lineHeight:      1,
            // Tiny white ring so the badge is readable against the bell
            outline:        '1.5px solid var(--bg-base)',
          }}>
            {badgeLabel}
          </span>
        )}
      </button>

      {/* ── Dropdown panel ───────────────────────────────── */}
      {open && (
        <GlassCard
          padding="0"
          borderRadius="var(--radius-lg)"
          style={{
            position:  'absolute',
            top:       'calc(100% + 8px)',
            right:      0,
            width:      340,
            zIndex:     200,
            // Override GlassCard default so the panel is slightly more opaque
            // than the sidebar (easier to read notification text)
            background:        'rgba(22, 27, 39, 0.96)',
            backdropFilter:    'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow:         '0 24px 64px rgba(0,0,0,0.6)',
            overflow:          'hidden',
          }}
        >
          {/* Header row */}
          <div style={{
            display:       'flex',
            alignItems:    'center',
            justifyContent:'space-between',
            padding:       '14px 16px',
            borderBottom:  '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{
                  marginLeft:   8,
                  fontSize:    '0.68rem',
                  fontWeight:   700,
                  background:  'rgba(99,102,241,0.15)',
                  border:      '1px solid rgba(99,102,241,0.3)',
                  color:       'var(--text-accent)',
                  borderRadius: 99,
                  padding:     '1px 7px',
                }}>
                  {unreadCount} unread
                </span>
              )}
            </span>

            {/* "Mark all as read" — only visible when there are unread items */}
            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead.mutate()}
                disabled={markAllRead.isPending}
                style={{
                  background:  'transparent',
                  border:      'none',
                  cursor:      markAllRead.isPending ? 'not-allowed' : 'pointer',
                  fontSize:   '0.75rem',
                  color:      'var(--text-muted)',
                  padding:     0,
                  opacity:     markAllRead.isPending ? 0.5 : 1,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {isLoading ? (
              // Loading state — simple text consistent with other small loaders
              <div style={{ padding: '24px 16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Loading...
                </p>
              </div>
            ) : notifications.length === 0 ? (
              // Empty state
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((n, idx) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  style={{
                    display:    'flex',
                    alignItems: 'flex-start',
                    gap:         10,
                    padding:    '12px 16px',
                    cursor:     'pointer',
                    // Unread rows get a subtle indigo tint; read rows are plain
                    background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.06)',
                    borderBottom: idx < notifications.length - 1
                      ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = n.isRead
                      ? 'transparent' : 'rgba(99,102,241,0.06)'
                  }}
                >
                  {/* Unread dot indicator — only visible for unread notifications */}
                  <span style={{
                    flexShrink: 0,
                    marginTop:  6,
                    width:       7,
                    height:      7,
                    borderRadius:'50%',
                    background:  n.isRead ? 'transparent' : 'var(--text-accent)',
                  }} />

                  {/* Message + timestamp */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin:      '0 0 3px',
                      fontSize:   '0.82rem',
                      fontWeight:  n.isRead ? 400 : 600,
                      color:       n.isRead ? 'var(--text-secondary)' : 'var(--text-primary)',
                      lineHeight:  1.45,
                    }}>
                      {n.message}
                    </p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlassCard>
      )}
    </div>
  )
}

export default NotificationBell
