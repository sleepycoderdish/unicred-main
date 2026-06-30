// src/layouts/AppShell.jsx
// ─────────────────────────────────────────────────────────────
// Main application shell — shown for all authenticated roles.
//
// Layout:
//   ┌──────────────────────────────────────────────────┐
//   │ Glass Sidebar (240px) │ Main area                │
//   │  Logo                 │  Topbar (64px)           │
//   │  Nav items            │  ─────────────────────  │
//   │                       │  <children> (scrolls)   │
//   │  User avatar          │                         │
//   └──────────────────────────────────────────────────┘
//
// Nav items come from roleConfig.js so each role sees their own menu.
// ─────────────────────────────────────────────────────────────

import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

import { getRoleConfig } from '@/config/roleConfig'
import { APP_NAME }      from '@/config/constants'
import useAuthStore      from '@/store/auth.store'
import { useAuth }       from '@/hooks/useAuth'
import { getInitials }   from '@/utils/formatters'
import { Spinner }       from '@/components/ui/Loader'

// ── Icon map for nav items ────────────────────────────────────
// Using simple SVG inline icons keyed by icon name from roleConfig
function NavIcon({ name }) {
  const icons = {
    LayoutDashboard: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    BookOpen:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>,
    BarChart2:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    CalendarCheck:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M9 16l2 2 4-4"/></svg>,
    ClipboardList:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
    Clock:           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    User:            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    Users:           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    UserPlus:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>,
    Upload:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>,
    Megaphone:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>,
    CalendarRange:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    RefreshCcw:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
    Building2:       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 22V4a2 2 0 012-2h8a2 2 0 012 2v18z"/><path d="M6 12H4a2 2 0 00-2 2v6a2 2 0 002 2h2"/><path d="M18 9h2a2 2 0 012 2v9a2 2 0 01-2 2h-2"/><line x1="10" y1="6" x2="10" y2="6"/><line x1="14" y1="6" x2="14" y2="6"/><line x1="10" y1="10" x2="10" y2="10"/><line x1="14" y1="10" x2="14" y2="10"/></svg>,
    Settings:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    Shield:          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  }
  return icons[name] || null
}

/**
 * AppShell — wraps all authenticated pages.
 *
 * @param {{ children: React.ReactNode }} props
 */
export function AppShell({ children }) {
  const user              = useAuthStore((s) => s.user)
  const { logout, loading: logoutLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Get nav items for this user's role
  const roleConf = getRoleConfig(user?.role)

  return (
    <div
      style={{
        display:          'grid',
        gridTemplateColumns: '240px 1fr',
        minHeight:         '100vh',
        background:       'var(--bg-base)',
      }}
    >
      {/* ── Glass Sidebar ─────────────────────────────────── */}
      <aside
        style={{
          position:       'sticky',
          top:             0,
          height:         '100vh',
          display:        'flex',
          flexDirection:  'column',
          background:     'rgba(22, 27, 39, 0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight:    '1px solid rgba(255,255,255,0.07)',
          padding:        '0',
          zIndex:          100,
          overflowY:      'auto',
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding:       '20px 20px 16px',
            display:       'flex',
            alignItems:    'center',
            gap:            10,
            borderBottom:  '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <img
            src="/unicred-logo.png"
            alt={APP_NAME}
            style={{
              width:  36,
              height: 36,
              filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.4)) brightness(1.15)',
            }}
          />
          <span
            style={{
              fontSize:   '1rem',
              fontWeight:  700,
              fontFamily: 'var(--font-display)',
              color:      'var(--text-primary)',
            }}
          >
            {APP_NAME}
          </span>
        </div>

        {/* Role label */}
        <div style={{ padding: '12px 20px 8px' }}>
          <span
            style={{
              fontSize:      '0.68rem',
              fontWeight:     600,
              color:         'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
            }}
          >
            {roleConf?.label}
          </span>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '4px 12px' }}>
          {roleConf?.nav.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path.split('/').length === 2} // exact match for root dashboard
              style={({ isActive }) => ({
                display:       'flex',
                alignItems:    'center',
                gap:            10,
                padding:       '9px 12px',
                borderRadius:  'var(--radius-sm)',
                marginBottom:   2,
                textDecoration: 'none',
                fontSize:      '0.85rem',
                fontWeight:     isActive ? 600 : 400,
                color:          isActive ? 'var(--text-accent)' : 'var(--text-secondary)',
                background:     isActive ? 'var(--accent-light)' : 'transparent',
                border:         isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                transition:    'background 0.15s, color 0.15s',
              })}
              onMouseEnter={(e) => {
                const a = e.currentTarget
                if (!a.getAttribute('aria-current')) {
                  a.style.background = 'var(--bg-elevated)'
                  a.style.color      = 'var(--text-primary)'
                }
              }}
              onMouseLeave={(e) => {
                const a = e.currentTarget
                if (!a.getAttribute('aria-current')) {
                  a.style.background = 'transparent'
                  a.style.color      = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ color: 'inherit', display: 'flex', alignItems: 'center', opacity: 0.85 }}>
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* ── User section at bottom ─────────────────────── */}
        <div
          style={{
            padding:    '16px',
            borderTop:  '1px solid rgba(255,255,255,0.06)',
            display:    'flex',
            flexDirection: 'column',
            gap:          10,
          }}
        >
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width:          36,
                height:         36,
                borderRadius:   '50%',
                background:     'var(--accent-light)',
                border:         '1px solid var(--accent-border)',
                display:        'flex',
                alignItems:     'center',
                justifyContent: 'center',
                fontSize:       '0.78rem',
                fontWeight:      700,
                color:          'var(--text-accent)',
                flexShrink:      0,
              }}
            >
              {getInitials(user?.name || '?')}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'User'}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0, textTransform: 'capitalize' }}>
                {user?.role}
              </p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            disabled={logoutLoading}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:          8,
              width:       '100%',
              background:  'transparent',
              border:      '1px solid rgba(248,113,113,0.2)',
              borderRadius: 'var(--radius-sm)',
              color:       'var(--danger)',
              fontSize:    '0.8rem',
              fontWeight:   500,
              padding:     '7px 12px',
              cursor:      logoutLoading ? 'not-allowed' : 'pointer',
              opacity:     logoutLoading ? 0.6 : 1,
              transition:  'background 0.15s',
            }}
            onMouseEnter={(e) => { if (!logoutLoading) e.currentTarget.style.background = 'var(--danger-light)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {logoutLoading ? <Spinner size={14} /> : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            )}
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content area ──────────────────────────────── */}
      <main
        style={{
          display:       'flex',
          flexDirection: 'column',
          minHeight:     '100vh',
          overflowX:     'hidden',
        }}
      >
        {/* Page content */}
        <div style={{ flex: 1, padding: '40px 36px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default AppShell